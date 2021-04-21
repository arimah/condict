import {Database} from 'better-sqlite3';
import DataLoader from 'dataloader';

import {FieldSet} from '../../model';

import {RwToken} from './rwlock';
import {
  DataAccessor,
  DataWriter,
  ExecResult,
  Awaitable,
  Value,
  Scalar,
  Param,
  RawSql,
  SqlLogger,
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
  private readonly logSql: (sql: string) => void;

  // TODO: See if it's meaningful to break out batching into a separate type.
  private readonly dataLoaders: Record<string, DataLoader<any, any>> = {};

  public constructor(database: Database, rwToken: RwToken, logSql: SqlLogger) {
    this.database = database;
    this.rwToken = rwToken;
    this.logSql = logSql;
  }

  // Undocumented methods implement members of DataReader or DataWriter.
  // Documentation is omitted here to reduce repetition. See those interfaces
  // for details.

  public get<Row>(parts: Sql, ...values: Value[]): Row | null {
    this.ensureValid();

    const params: Param[] = [];
    const sql = formatSql(parts, values, params);

    const stmt = this.database.prepare(sql);
    if (!stmt.reader) {
      throw new Error('The specified SQL does not return data');
    }

    this.logSql(sql);
    return stmt.get(params) as Row || null;
  }

  public getRequired<Row>(parts: Sql, ...values: Value[]): Row {
    this.ensureValid();

    const params: Param[] = [];
    const sql = formatSql(parts, values, params);

    const stmt = this.database.prepare(sql);
    if (!stmt.reader) {
      throw new Error('The specified SQL does not return data');
    }

    this.logSql(sql);
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

    const stmt = this.database.prepare(sql);
    if (!stmt.reader) {
      throw new Error('The specified SQL does not return data');
    }

    this.logSql(sql);
    return stmt.all(params) as Row[];
  }

  public exec<I extends number = number>(
    parts: Sql,
    ...values: Value[]
  ): ExecResult<I> {
    this.ensureValid();

    const params: Param[] = [];
    const sql = formatSql(parts, values, params);

    const stmt = this.database.prepare(sql);
    if (this.rwToken.isReader && !stmt.reader) {
      throw new Error('Cannot execute a mutating statement on a read-only accessor');
    }

    this.logSql(sql);

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

    const db = this.database;

    // We have to upgrade the token *first*, so we have exclusive write access
    // once the transaction is underway.
    const writerToken = await this.rwToken.upgrade();

    db.prepare('begin').run();

    let result: R;
    try {
      result = await callback(new Accessor(db, writerToken, this.logSql));

      db.prepare('commit').run();
    } catch (e) {
      db.prepare('rollback').run();
      throw e;
    } finally {
      this.rwToken = writerToken.downgrade();
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

  public batchOneToOne<K extends string | number, Row, E = undefined>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: readonly K[], extraArg?: E) => Awaitable<Row[]>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row | null> {
    this.ensureValid();

    let dataLoader: DataLoader<K, Row | null>;

    if (!this.dataLoaders[batchKey]) {
      dataLoader = new DataLoader<K, Row | null>(async ids => {
        const rows = await fetcher(this, ids, extraArg);
        const rowsById = rows.reduce((acc, row) => {
          acc.set(getRowId(row), row);
          return acc;
        }, new Map<K, Row>());
        return ids.map(id => rowsById.get(id) || null);
      });
      this.dataLoaders[batchKey] = dataLoader;
    } else {
      dataLoader = this.dataLoaders[batchKey] as DataLoader<K, Row | null>;
    }

    return dataLoader.load(id);
  }

  public batchOneToMany<K extends string | number, Row, E = undefined>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: readonly K[], extraArg?: E) => Awaitable<Row[]>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row[]> {
    this.ensureValid();

    let dataLoader: DataLoader<K, Row[]>;

    if (!this.dataLoaders[batchKey]) {
      dataLoader = new DataLoader<K, Row[]>(async ids => {
        const rows = await fetcher(this, ids, extraArg as E);

        // If there is only a single ID, assume all rows belong to it.
        if (ids.length === 1) {
          return [rows];
        }

        // Otherwise, find out which ID each row belongs to.
        const rowsById = rows.reduce((acc, row) => {
          const rowId = getRowId(row);
          const currentRows = acc.get(rowId);
          if (!currentRows) {
            acc.set(rowId, [row]);
          } else {
            currentRows.push(row);
          }
          return acc;
        }, new Map<K, Row[]>());
        return ids.map(id => rowsById.get(id) || []);
      });
      this.dataLoaders[batchKey] = dataLoader;
    } else {
      dataLoader = this.dataLoaders[batchKey] as DataLoader<K, Row[]>;
    }

    return dataLoader.load(id);
  }

  public clearCache<K extends string | number>(batchKey: string, id: K): void {
    if (this.dataLoaders[batchKey]) {
      this.dataLoaders[batchKey].clear(id);
    }
  }

  public finish(): void {
    if (this.rwToken.isValid) {
      if (this.rwToken.isWriter) {
        throw new Error('Writers are disposed automatically: cannot call `finish`');
      }
      this.rwToken.finish();
    }
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
