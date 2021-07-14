import {FieldSet} from '../../model';

/** Contains database configuration. */
export interface Options {
  /**
   * The path to the database file. The file is created if it does not exist.
   */
  readonly file: string;
}

export const validateOptions = (options: any): Options => {
  if (options == null || typeof options !== 'object') {
    throw new Error('Database config must be an object.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const file = options.file;
  if (typeof file !== 'string') {
    throw new Error('Database file name must be a string.');
  }
  if (file === '') {
    throw new Error('Database file name cannot be empty.');
  }
  return {file};
};

/**
 * The base interface for a database reader. Queries executed through methods
 * on this interface are not permitted to update the database in any way.
 * Accepting this interface as an argument is an implicit promise that the
 * method will not attempt to change the data in the database; it indicates
 * that the function only ever needs read access.
 */
export interface DataReader {
  /**
   * Fetches the first row that matches a query.
   * @param query An SQL query string.
   * @return The first matching row, or null if no row matches.
   */
  get<Row>(query: string): Row | null;
  /**
   * Fetches the first row that matches a query. This overload should be used
   * as a template string tag.
   * @param parts Template string parts.
   * @param values Values to be embedded in the query.
   * @return The first matching row, or null if no row matches.
   */
  get<Row>(parts: TemplateStringsArray, ...values: Value[]): Row | null;

  /**
   * Fetches the first row that matches a query. If no row is found, throws
   * an error.
   * @param query An SQL query string.
   * @return The first matching row.
   * @throws {Error} No rows were found.
   */
  getRequired<Row>(query: string): Row;
  /**
   * Fetches the first row that matches a query. If no row is found, throws
   * an error. This overload should be used as a template string tag.
   * @param parts Template string parts.
   * @param values Values to be embedded in the query.
   * @return The first matching row.
   * @throws {Error} No rows were found.
   */
  getRequired<Row>(parts: TemplateStringsArray, ...values: Value[]): Row;

  /**
   * Fetches all rows that match a query.
   * @param query An SQL query string.
   * @return The rows that match the query.
   */
  all<Row>(query: string): Row[];
  /**
   * Fetches all rows that match a query. This overload should be used as a
   * template string tag.
   * @param parts Template string parts.
   * @param values Values to be embedded in the query.
   * @return The rows that match the query.
   */
  all<Row>(parts: TemplateStringsArray, ...values: Value[]): Row[];

  /**
   * Treats the specified string as raw SQL, enabling it to be inserted into
   * queries and commands without being escaped.
   * @param sql An SQL string.
   * @return A value that can be embedded into future queries and commands
   *         without being escaped.
   */
  raw(sql: string): RawSql;
  /**
   * Treats the specified string as raw SQL, enabling it to be inserted into
   * queries and commands without being escaped. This overload should be used
   * as a template string tag.
   * @param parts Template string parts.
   * @param values Values to be embedded in the SQL string.
   * @return A value that can be embedded into future queries and commands
   *         without being escaped.
   */
  raw(parts: TemplateStringsArray, ...values: Value[]): RawSql;

  /**
   * Determines whether the specified table exists.
   * @param name The table name to look up.
   * @return True if the table exists, or false if it does not.
   */
  tableExists(name: string): boolean;

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
  batchOneToOne<K extends string | number, Row>(
    batchKey: string,
    id: K,
    fetcher: BatchFn<K, Row>,
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
  batchOneToOne<K extends string | number, Row, E>(
    batchKey: string,
    id: K,
    fetcher: BatchFn<K, Row, E>,
    getRowId: (row: Row) => K,
    extraArg: E
  ): Promise<Row | null>;

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
  batchOneToMany<K extends string | number, Row>(
    batchKey: string,
    id: K,
    fetcher: BatchFn<K, Row>,
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
  batchOneToMany<K extends string | number, Row, E>(
    batchKey: string,
    id: K,
    fetcher: BatchFn<K, Row, E>,
    getRowId: (row: Row) => K,
    extraArg: E
  ): Promise<Row[]>;

  /**
   * Clear the batch cache associated with the specified batch key and ID. The
   * cache is local to the request.
   * @param batchKey The key to clear cache for.
   * @param id The ID to clear cache for.
   */
  clearCache<K extends string | number>(batchKey: string, id: K): void;
}

export type BatchFn<K extends string | number, Row, E = undefined> = (
  db: DataReader,
  ids: readonly K[],
  extraArg: E
) => Awaitable<Row[]>;

/**
 * A database connection that has shared read-only access and must be disposed
 * on the work is complete (by calling `finish`). Exclusive read-write access
 * can be requested through the `transact` method. Accepting this interface as
 * an argument implies that the function may write to the database by acquiring
 * a read-write access.
 */
export interface DataAccessor extends DataReader {
  /**
   * Runs the specified callback inside a write transaction. The return value of
   * the callback becomes the return value of this method. Nested transactions
   * are not supported.
   *
   * While the transaction is running, the DataWriter passed to the callback
   * must be used to write to the database. The instance that this method is
   * called on cannot be used for the duration of the transaction.
   * @param callback The callback to call inside a transaction. It receives a
   *        DataWriter that is used to write to the database.
   * @return A promise that resolves to the return value of the callback. The
   *         promise is rejected if an error occurs inside the callback, or if
   *         the underlying readers-writer lock is closed.
   */
  transact<R>(callback: (db: DataWriter) => Awaitable<R>): Promise<R>;

  /**
   * Marks the work done on this reader as finished. The connection cannot be
   * used after calling this method.
   */
  finish(): void;
}

/**
 * A database connection that has exclusive read-write access. It is obtained
 * in the `transact` method on DataAccessor, and is disposed of automatically
 * when the transaction is complete. Accepting this interface as an argument
 * implies that the function expects an exclusive read-write lock to be held,
 * and that the function intends to modify the database.
 */
export interface DataWriter extends DataReader {
  /**
   * Executes a non-query SQL command.
   *
   * To perform a SELECT, use `get`, `getRequired` or `all`.
   * @param cmd An SQL command string.
   * @return The result of the command.
   */
  exec<I extends number = number>(cmd: string): ExecResult<I>;
  /**
   * Executes a non-query SQL command. This overload should be used as a
   * template string tag.
   *
   * To perform a SELECT, use `get`, `getRequired` or `all`.
   * @param parts Template string parts.
   * @param values Values to be embedded in the command.
   * @return The result of the command.
   */
  exec<I extends number = number>(
    parts: TemplateStringsArray,
    ...values: Value[]
  ): ExecResult<I>;
}

/** Contains the result of a non-query command execution. */
export interface ExecResult<I extends number> {
  /**
   * The ID of the last inserted row. If the command passed to `exec` did not
   * insert any rows, the value of this field is unspecified.
   */
  readonly insertId: I;
  /** The total number of rows affected by the command. */
  readonly affectedRows: number;
}

/** A value that can be awaited. */
export type Awaitable<T> = T | Promise<T>;

/**
 * Represents raw SQL text. Values of this class can be embedded directly in
 * SQL queries and commands without escaping, unlike regular string values.
 * The `raw` method on the database can be used to construct RawSql values.
 */
export class RawSql {
  public readonly sql: string;
  public readonly params: readonly Param[];

  public constructor(sql: string, params: readonly Param[]) {
    this.sql = sql;
    this.params = params;
  }

  public static join(parts: readonly RawSql[], separator: string): RawSql {
    return new RawSql(
      parts.map(r => r.sql).join(separator),
      parts.reduce<readonly Param[]>((acc, r) => acc.concat(r.params), [])
    );
  }
}

/** A scalar value that can be embedded in an SQL string. */
export type Scalar =
  | RawSql
  | string
  | number
  | boolean
  | null
  | undefined;

/** A value that can be embedded in an SQL string. */
export type Value =
  | FieldSet<{readonly [k: string]: Scalar}>
  | readonly Scalar[]
  | Scalar;

/** An SQL parameter. */
export type Param = string | number | null;

/** A function that logs an executed SQL string. */
export type SqlLogger = (sql: string) => void;
