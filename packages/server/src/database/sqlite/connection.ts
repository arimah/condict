import {Database} from 'better-sqlite3';
import {Pool} from 'generic-pool';
import DataLoader from 'dataloader';

import FieldSet from '../../model/field-set';
import {Logger} from '../../types';

import reindentQuery from '../reindent-query';

import {ExecResult, Awaitable, Value, Scalar, Param, RawSql} from './types';

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
 * Encapsulates a database connection, which supports queries, commands and
 * batching of queries. When a request is finished using the connection, it
 * must be returned to its pool using the `release` method.
 */
export default class Connection {
  private readonly logger: Logger;
  private readonly database: Database;
  private readonly pool: Pool<Database>;

  // TODO: See if it's meaningful to break out batching into a separate type.
  private readonly dataLoaders: Record<string, DataLoader<any, any>> = {};
  private readonly logQueries: boolean;

  public constructor(logger: Logger, database: Database, pool: Pool<Database>) {
    this.logger = logger;
    this.database = database;
    this.pool = pool;

    this.logQueries = process.env.DEBUG_QUERIES === '1';
  }

  /**
   * Fetches the first row that matches a query.
   * @param query An SQL query string.
   * @return The first matching row, or null if no row matches.
   */
  public get<Row>(query: string): Row | null;
  /**
   * Fetches the first row that matches a query. This overload should be used
   * as a template string tag.
   * @param parts Template string parts.
   * @param values Values to be embedded in the query.
   * @return The first matching row, or null if no row matches.
   */
  public get<Row>(parts: TemplateStringsArray, ...values: Value[]): Row | null;
  public get<Row>(parts: Sql, ...values: Value[]): Row | null {
    const params: Param[] = [];
    const sql = formatSql(parts, values, params);
    this.logQuery(sql);
    return this.database.prepare(sql).get(params) as Row || null;
  }

  /**
   * Fetches the first row that matches a query. If no row is found, throws
   * an error.
   * @param query An SQL query string.
   * @return The first matching row.
   * @throws {Error} No rows were found.
   */
  public getRequired<Row>(query: string): Row;
  /**
   * Fetches the first row that matches a query. If no row is found, throws
   * an error. This overload should be used as a template string tag.
   * @param parts Template string parts.
   * @param values Values to be embedded in the query.
   * @return The first matching row.
   * @throws {Error} No rows were found.
   */
  public getRequired<Row>(parts: TemplateStringsArray, ...values: Value[]): Row;
  public getRequired<Row>(parts: Sql, ...values: Value[]): Row {
    const params: Param[] = [];
    const sql = formatSql(parts, values, params);
    this.logQuery(sql);
    const row = this.database.prepare(sql).get(params) as Row || null;
    if (row === null) {
      throw new Error('No rows found');
    }
    return row;
  }

  /**
   * Fetches all rows that match a query.
   * @param query An SQL query string.
   * @return The rows that match the query.
   */
  public all<Row>(query: string): Row[];
  /**
   * Fetches all rows that match a query. This overload should be used as a
   * template string tag.
   * @param parts Template string parts.
   * @param values Values to be embedded in the query.
   * @return The rows that match the query.
   */
  public all<Row>(parts: TemplateStringsArray, ...values: Value[]): Row[];
  public all<Row>(parts: Sql, ...values: Value[]): Row[] {
    const params: Param[] = [];
    const sql = formatSql(parts, values, params);
    this.logQuery(sql);
    return this.database.prepare(sql).all(params) as Row[];
  }

  /**
   * Executes a non-query SQL command.
   *
   * To perform a SELECT, use `get`, `getRequired` or `all`.
   * @param cmd An SQL command string.
   * @return The result of the command.
   */
  public exec<I extends number = number>(cmd: string): ExecResult<I>;
  /**
   * Executes a non-query SQL command. This overload should be used as a
   * template string tag.
   *
   * To perform a SELECT, use `get`, `getRequired` or `all`.
   * @param parts Template string parts.
   * @param values Values to be embedded in the command.
   * @return The result of the command.
   */
  public exec<I extends number = number>(
    parts: TemplateStringsArray,
    ...values: Value[]
  ): ExecResult<I>;
  public exec<I extends number = number>(
    parts: Sql,
    ...values: Value[]
  ): ExecResult<I> {
    const params: Param[] = [];
    const sql = formatSql(parts, values, params);
    this.logQuery(sql);
    const {
      changes: affectedRows,
      lastInsertRowid: insertId,
    } = this.database.prepare(sql).run(params);
    return {insertId: insertId as I, affectedRows};
  }

  /**
   * Treats the specified string as raw SQL, enabling it to be inserted into
   * queries and commands without being escaped.
   * @param sql An SQL string.
   * @return A value that can be embedded into future queries and commands
   *         without being escaped.
   */
  public raw(sql: string): RawSql;
  /**
   * Treats the specified string as raw SQL, enabling it to be inserted into
   * queries and commands without being escaped. This overload should be used
   * as a template string tag.
   * @param parts Template string parts.
   * @param values Values to be embedded in the SQL string.
   * @return A value that can be embedded into future queries and commands
   *         without being escaped.
   */
  public raw(parts: TemplateStringsArray, ...values: Value[]): RawSql;
  public raw(parts: Sql, ...values: Value[]): RawSql {
    const params: Param[] = [];
    const sql = formatSql(parts, values, params);
    return new RawSql(sql, params);
  }

  /**
   * Begins a transaction on this connection. Nested transactions are not
   * supported.
   */
  public beginTransaction(): void {
    this.database.prepare('begin').run();
  }

  /** Commits the current transasction. */
  public commit(): void {
    this.database.prepare('commit').run();
  }

  /** Rolls back the current transaction. */
  public rollBack(): void {
    this.database.prepare('rollback').run();
  }

  /**
   * Runs the specified callback inside a transaction. The return value of the
   * callback is used as the return value of this method. Nested transactions
   * are not supported.
   * @param callback The callback to call inside a transaction.
   * @return A promise that resolves to the return value of the callback.
   */
  public async transact<R>(callback: () => Awaitable<R>): Promise<R> {
    this.beginTransaction();
    let result: R;
    try {
      result = await callback();
      this.commit();
    } catch (e) {
      this.rollBack();
      throw e;
    }
    return result;
  }

  /**
   * Determines whether the specified table exists.
   * @param name The table name to look up.
   * @return True if the table exists, or false if it does not.
   */
  public tableExists(name: string): boolean {
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

  /**
   * Returns the database connection to its pool. The connection should not be
   * used by the request after calling this method.
   */
  public release(): void {
    this.pool.release(this.database);
  }

  /**
   * Batches a query; that is, combines multiple queries (from the same tick
   * of the event loop) into a single lookup. The query is expected to match
   * at most one row per input ID.
   * @param batchKey The key to associate with this batch. All queries with
   *        the same key are batched together.
   * @param id The ID to look up. This does not have to be the row's primary
   *        key; it can be any primitive value.
   * @param fetcher A function that receives all IDs of the batch and returns
   *        an awaitable value with all matching rows. Each ID can match at
   *        most one row.
   * @param getRowId A function that extracts a result row's ID.
   * @return A promise that resolves to the row matching `id`, or null if no
   *         row matches.
   */
  public batchOneToOne<K extends string | number, Row>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: readonly K[]) => Awaitable<Row[]>,
    getRowId: (row: Row) => K
  ): Promise<Row | null>;
  /**
   * Batches a query; that is, combines multiple queries (from the same tick
   * of the event loop) into a single lookup. The query is expected to match
   * at most one row per input ID.
   * @param batchKey The key to associate with this batch. All queries with
   *        the same key are batched together.
   * @param id The ID to look up. This does not have to be the row's primary
   *        key; it can be any primitive value.
   * @param fetcher A function that receives all IDs of the batch and returns
   *        an awaitable value with all matching rows. Each ID can match at
   *        most one row.
   * @param getRowId A function that extracts a result row's ID.
   * @param extraArg An extra argument to pass into the `fetcher` callback.
   *        If this method is called multiple times with the same `batchKey`
   *        but a different `extraArg`, only the value from the very first
   *        call is used.
   * @return A promise that resolves to the row matching `id`, or null if no
   *         row matches.
   */
  public batchOneToOne<K extends string | number, Row, E>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: readonly K[], extraArg: E) => Awaitable<Row[]>,
    getRowId: (row: Row) => K,
    extraArg: E
  ): Promise<Row | null>;
  public batchOneToOne<K extends string | number, Row, E = undefined>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: readonly K[], extraArg?: E) => Awaitable<Row[]>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row | null> {
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

  /**
   * Batches a query; that is, combines multiple queries (from the same tick
   * of the event loop) into a single lookup. The query can match any number
   * of rows per input ID.
   * @param batchKey The key to associate with this batch. All queries with
   *        the same key are batched together.
   * @param id The ID to look up. This does not have to be the row's primary
   *        key; it can be any primitive value.
   * @param fetcher A function that receives all IDs of the batch and returns
   *        an awaitable value with all matching rows. Each ID can match any
   *        number of rows.
   * @param getRowId A function that extractcs a result row's ID.
   * @return A promise that resolves to the rows matching `id`. If none were
   *         found, the array will be empty.
   */
  public batchOneToMany<K extends string | number, Row>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: readonly K[]) => Awaitable<Row[]>,
    getRowId: (row: Row) => K
  ): Promise<Row[]>;
  /**
   * Batches a query; that is, combines multiple queries (from the same tick
   * of the event loop) into a single lookup. The query can match any number
   * of rows per input ID.
   * @param batchKey The key to associate with this batch. All queries with
   *        the same key are batched together.
   * @param id The ID to look up. This does not have to be the row's primary
   *        key; it can be any primitive value.
   * @param fetcher A function that receives all IDs of the batch and returns
   *        an awaitable value with all matching rows. Each ID can match any
   *        number of rows.
   * @param getRowId A function that extractcs a result row's ID.
   * @param extraArg An extra argument to pass into the `fetcher` callback,
   *        If this method is called multiple times with the same `batchKey`
   *        but a different `extraArg`, only the value from the very first
   *        call is used.
   * @return A promise that resolves to the rows matching `id`. If none were
   *         found, the array will be empty.
   */
  public batchOneToMany<K extends string | number, Row, E>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: readonly K[], extraArg: E) => Awaitable<Row[]>,
    getRowId: (row: Row) => K,
    extraArg: E
  ): Promise<Row[]>;
  public batchOneToMany<K extends string | number, Row, E = undefined>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: readonly K[], extraArg?: E) => Awaitable<Row[]>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row[]> {
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

  /**
   * Clear the batch cache associated with the specified batch key and ID. The
   * cache is local to the request.
   * @param batchKey The key to clear cache for.
   * @param id The ID to clear cache for.
   */
  public clearCache<K extends string | number>(batchKey: string, id: K): void {
    if (this.dataLoaders[batchKey]) {
      this.dataLoaders[batchKey].clear(id);
    }
  }

  /**
   * Logs the execution of a query. If `this.logQueries` is false, the query
   * is not logged.
   * @param sql The query to log.
   */
  private logQuery(sql: string): void {
    if (!this.logQueries) {
      return;
    }

    if (/^\s*$/.test(sql)) {
      this.logger.warn('Empty query?!');
    } else {
      const reindentedSql = reindentQuery(sql);
      this.logger.debug(`Query:\n${reindentedSql}`);
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
