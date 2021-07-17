import {Database, Statement} from 'better-sqlite3';

import {FieldSet} from '../../model';

import {RwToken} from './rwlock';
import RequestCache from './request-cache';
import {
  DataAccessor,
  DataWriter,
  BatchFn,
  ExecResult,
  Awaitable,
  Value,
  Scalar,
  Param,
  RawSql,
  SqlLogger,
  QueryPlanNode,
} from './types';

/**
 * An SQL string, or a template string array that is used to construct an
 * SQL string.
 */
type Sql = TemplateStringsArray | string;

// Please note: This function should probably be replaced by something more
// robust, as it will fail miserably with certain field names. We use it in
// this adaptor only because all the code is trusted; there are no foreign
// queries anywhere.
const escapeId = (id: string) => '`' + id + '`';

/**
 * Implements a DataAccessor and DataWriter, which supports queries, commands
 * and batching of queries.
 *
 * Every accessor is in either shared read-only mode or exclusive read-write
 * mode. A read-only accessor is only allowed to execute `SELECT` queries (and
 * other SQL operations that return data), while a read-write accessor can also
 * execute `INSERT`s, `UPDATE`s, `DELETE`s and schema-altering operations.
 *
 * Exclusive read-write access is requested through the `transact` method. See
 * more details in the the `DataAccessor` interface's documentation.
 */
export default class Accessor implements DataAccessor, DataWriter {
  private readonly database: Database;
  private rwToken: RwToken;
  private readonly logger: SqlLogger;

  // TODO: See if it's meaningful to break out batching into a separate type.
  private readonly cache: RequestCache;

  public constructor(
    database: Database,
    rwToken: RwToken,
    logger: SqlLogger,
    sharedCache?: RequestCache
  ) {
    this.database = database;
    this.rwToken = rwToken;
    this.logger = logger;
    this.cache = sharedCache ?? new RequestCache(this);
  }

  // Undocumented methods implement members of DataReader or DataWriter.
  // Documentation is omitted here to reduce repetition. See those interfaces
  // for details.

  public get<Row>(parts: Sql, ...values: Value[]): Row | null {
    this.ensureValid();

    const params: Param[] = [];
    const sql = formatSql(parts, values, params);

    const stmt = this.prepare(sql);
    if (!stmt.readonly && this.rwToken.isReader) {
      throw new Error('Cannot execute a mutating statement as a reader');
    }
    if (!stmt.reader) {
      throw new Error('The specified SQL does not return data');
    }

    if (this.logger.logQueryPlan) {
      this.explainQueryPlan(sql, params);
    }

    return stmt.get(params) as Row || null;
  }

  public getRequired<Row>(parts: Sql, ...values: Value[]): Row {
    this.ensureValid();

    const params: Param[] = [];
    const sql = formatSql(parts, values, params);

    const stmt = this.prepare(sql);
    if (this.rwToken.isReader && !stmt.readonly) {
      throw new Error('Cannot execute a mutating statement as a reader');
    }
    if (!stmt.reader) {
      throw new Error('The specified SQL does not return data');
    }

    if (this.logger.logQueryPlan) {
      this.explainQueryPlan(sql, params);
    }

    const row = stmt.get(params) as Row | undefined;

    if (row === undefined) {
      throw new Error('No rows found');
    }
    return row;
  }

  public all<Row>(parts: Sql, ...values: Value[]): Row[] {
    this.ensureValid();

    const params: Param[] = [];
    const sql = formatSql(parts, values, params);

    const stmt = this.prepare(sql);
    if (this.rwToken.isReader && !stmt.readonly) {
      throw new Error('Cannot execute a mutating statement as a reader');
    }
    if (!stmt.reader) {
      throw new Error('The specified SQL does not return data');
    }

    if (this.logger.logQueryPlan) {
      this.explainQueryPlan(sql, params);
    }

    return stmt.all(params) as Row[];
  }

  public exec<I extends number = number>(
    parts: Sql,
    ...values: Value[]
  ): ExecResult<I> {
    this.ensureValid();

    const params: Param[] = [];
    const sql = formatSql(parts, values, params);

    const stmt = this.prepare(sql);
    if (this.rwToken.isReader && !stmt.readonly) {
      throw new Error('Cannot execute a mutating statement as a reader');
    }

    const {
      changes: affectedRows,
      lastInsertRowid: insertId,
    } = stmt.run(params);
    return {insertId: insertId as I, affectedRows};
  }

  public raw(parts: Sql, ...values: Value[]): RawSql {
    const params: Param[] = [];
    const sql = formatSql(parts, values, params);
    return new RawSql(sql, params);
  }

  public async transact<R>(
    callback: (db: DataWriter) => Awaitable<R>
  ): Promise<R> {
    this.ensureValid();

    // We have to upgrade the token *first*, so we have exclusive write access
    // once the transaction is underway.
    const writerToken = await this.rwToken.upgrade();

    this.prepare('begin').run();

    let result: R;
    try {
      const writer = new Accessor(
        this.database,
        writerToken,
        this.logger,
        this.cache
      );
      this.cache.setDataReader(writer);
      result = await callback(writer);

      this.prepare('commit').run();
    } catch (e) {
      this.prepare('rollback').run();
      throw e;
    } finally {
      this.rwToken = writerToken.downgrade();
      this.cache.setDataReader(this);
    }
    return result;
  }

  public tableExists(name: string): boolean {
    this.ensureValid();

    const {found} = this.getRequired<{found: number}>`
      select exists (
        select 1
        from sqlite_master
        where type = 'table'
          and name = ${name}
      ) as found
    `;
    return found === 1;
  }

  public batchOneToOne<K extends string | number, Row, E = void>(
    batchKey: string,
    id: K,
    fetcher: BatchFn<K, Row, E>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row | null> {
    this.ensureValid();
    return this.cache.batchOneToOne(batchKey, id, fetcher, getRowId, extraArg);
  }

  public batchOneToMany<K extends string | number, Row, E = void>(
    batchKey: string,
    id: K,
    fetcher: BatchFn<K, Row, E>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row[]> {
    this.ensureValid();
    return this.cache.batchOneToMany(batchKey, id, fetcher, getRowId, extraArg);
  }

  public clearCache<K extends string | number>(batchKey: string, id: K): void {
    this.cache.clear(batchKey, id);
  }

  public finish(): void {
    if (this.rwToken.isValid) {
      if (this.rwToken.isWriter) {
        throw new Error('Writers are disposed automatically: cannot call `finish`');
      }
      this.rwToken.finish();
    }
  }

  private prepare(sql: string): Statement {
    this.logger.logQuery(sql);
    return this.database.prepare(sql);
  }

  private explainQueryPlan(sql: string, params: Param[]): void {
    type Row = [number, number, number, string];

    const stmt = this.database.prepare(`explain query plan ${sql}`);
    stmt.raw(true);

    const rows = stmt.all(params) as Row[];
    // This function is only ever entered when logQueryPlan != null.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.logger.logQueryPlan!(rows.map(row => ({
      id: row[0],
      parentId: row[1],
      description: row[3],
    })));
  }

  private ensureValid(): void {
    if (!this.rwToken.isValid) {
      throw new Error('This accessor is no longer valid');
    }
  }
}

const isArray: (value: any) => value is readonly any[] = Array.isArray;

/**
 * Formats a string or template string arguments into an SQL string.
 * @param parts An SQL string, or a template strings array.
 * @param values Contains the values of embedded expressions, if the `parts`
 *        parameter contains a template strings array. Otherwise, this value
 *        is ignored.
 * @return The formatted SQL.
 */
const formatSql = (parts: Sql, values: Value[], params: Param[]): string => {
  // Single query with nothing else
  if (typeof parts === 'string') {
    return parts;
  }

  // Skip a tiny amount of extra work occasionally.
  if (parts.length === 1) {
    return parts[0];
  }

  let sql = '';
  for (let i = 0; i < parts.length; i++) {
    sql += parts[i];
    if (i < values.length) {
      sql += formatValue(values[i], params);
    }
  }
  return sql;
};

const formatValue = (value: Value, params: Param[]): string => {
  if (isArray(value)) {
    return value.map(v => formatScalar(v, params)).join(', ');
  }
  if (value instanceof FieldSet) {
    const inner = value.toPlainObject();
    return Object.keys(inner)
      .map(key => `${escapeId(key)} = ${formatScalar(inner[key], params)}`)
      .join(', ');
  }
  return formatScalar(value, params);
};

const formatScalar = (value: Scalar, params: Param[]): string => {
  if (value instanceof RawSql) {
    params.push(...value.params);
    return value.sql;
  }
  switch (typeof value) {
    case 'boolean':
      return value ? '1' : '0';
    case 'number':
      return String(value);
    case 'string':
      params.push(value);
      return '?';
    default: // null | undefined
      params.push(null);
      return '?';
  }
};
