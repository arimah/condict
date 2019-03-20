import DataLoader from 'dataloader';
import {Logger} from 'winston';

import FieldSet from '../model/field-set';
import {Connection, PageParams} from '../schema/types';
import {createConnection} from '../schema/helpers';

import reindentQuery from './reindent-query';

export type Sql = TemplateStringsArray | string;

/**
 * Represents a generic awaitable value of type T. That is, either a promise
 * that resolves to a T, or just a plain T.
 */
export type Awaitable<T> = Promise<T> | T;

/**
 * Contains the result of a command execution.
 */
export interface ExecResult {
  /**
   * The ID of the last inserted row. If the command passed to `exec` did not
   * insert any rows, the value of this field is unspecified.
   */
  insertId: number;
  /** The total number of rows affected by the command. */
  affectedRows: number;
}

interface DataLoaders {
  [k: string]: DataLoader<any, any>;
}

/**
 * Encapsulates a database connection, which supports queries, commands and
 * batching of queries. When a request is finished using the connection, it
 * should be returned to its pool using the `release` method.
 */
abstract class Adaptor {
  private readonly logger: Logger;
  private readonly dataLoaders: DataLoaders = {};
  private readonly logQueries: boolean;

  public constructor(logger: Logger) {
    this.logger = logger;

    this.logQueries = process.env.DEBUG_QUERIES === '1';
  }

  /**
   * Fetches the first row that matches a query. This method can be called
   * directly or used as a template string tag.
   * @param parts An SQL string, or a template strings array.
   * @param values When invoked with a template strings array, contains the
   *        values of embedded expressions.
   * @return A row or a promise containing a row. If no row matches, the value
   *         will be null.
   */
  public abstract get<Row>(parts: Sql, ...values: any[]): Awaitable<Row | null>;

  /**
   * Fetches the first row that matches a query. If the query does not return
   * any rows, an error is thrown. This method can be called directly or used
   * as a tempate string tag.
   * @param parts An SQL string, or a template strings array.
   * @param values When invoked with a template strings array, contains the
   *        values of embedded expressions.
   * @return The found row or a promise that resolves to the row.
   */
  public abstract getRequired<Row>(parts: Sql, ...values: any[]): Awaitable<Row>;

  /**
   * Fetches all rows that match a query. This method can be called directly
   * or used as a template string tag.
   * @param parts An SQL string, or a template strings array.
   * @param values When invoked with a template strings array, contains the
   *        values of embedded expressions.
   * @return An array of rows or a promise of such. If no rows match, the
   *         array will be empty.
   */
  public abstract all<Row>(parts: Sql, ...values: any[]): Awaitable<Row[]>;

  /**
   * Executes an SQL command and returns information about its result. This
   * method can be called directly or used as a template string tag.
   *
   * To perform a SELECT, use `get` or `all`.
   * @param parts An SQL string, or a template strings array.
   * @param values When invoked with a template strings array, contains the
   *        values of embedded expressions.
   * @return Details about the result of the command.
   */
  public abstract exec(parts: Sql, ...values: any[]): Awaitable<ExecResult>;

  /**
   * Treats the specified string as raw SQL, enabling it to be inserted into
   * queries and commands without being escaped. This method can be called
   * directly or used as a template string tag.
   * @param parts An SQL string, or a template strings array.
   * @param values When invoked with a template strings array, contains the
   *        values of embedded expressions.
   * @return A value that can be embedded into future queries and commands
   *         without being subject to escaping.
   */
  public abstract raw(parts: Sql, ...values: any[]): any;

  /**
   * Begins a transaction on this connection. Nested transactions are not
   * supported.
   */
  public abstract beginTransaction(): Awaitable<void>;

  /**
   * Commits the current transasction.
   */
  public abstract commit(): Awaitable<void>;

  /**
   * Rolls back the current transaction.
   */
  public abstract rollBack(): Awaitable<void>;

  /**
   * Returns the database connection to its pool. The connection should not be
   * used by the request after calling this method.
   */
  public abstract release(): void;

  /**
   * Determines whether the specified table exists. If the database engine has
   * support for multiple schemas, this function always looks up tables in the
   * currently selected schema.
   * @param name The table name to look up.
   * @return A value indicating whether the table exists, or a promise of such
   *         a value.
   */
  public abstract tableExists(name: string): Awaitable<boolean>;

  /**
   * Paginates a resource, creating a connection value that is compatible with
   * the GraphQL schema.
   * @param page Determines which page to fetch and how many items to fetch
   *        from that page.
   * @param getTotal A callback that returns a promise that resolves to the
   *        total number of matching items.
   * @param getNodes A callback that returns an awaitable value that resolves
   *        to the nodes in the current page. It takes the database connection,
   *        the limit (number of nodes per page), and the start offset.
   * @return A connection value that contains the nodes of the current page as
   *         well as metadata about the connection.
   */
  public async paginate<Row>(
    page: PageParams,
    getTotal: (db: this) => Awaitable<number>,
    getNodes: (db: this, limit: number, offset: number) => Awaitable<Row[]>
  ): Promise<Connection<Row>> {
    const offset = page.page * page.perPage;
    const [total, nodes] = await Promise.all([
      getTotal(this),
      getNodes(this, page.perPage, offset),
    ]);
    return createConnection(page, total, nodes);
  }

  /**
   * Runs the specified callback inside a transaction. The return value of the
   * callback is used as the return value of this method. Nested transactions
   * are not supported.
   * @param callback The callback to call inside a transaction.
   * @return A promise that resolves to the return value of the callback.
   */
  public async transact<R>(callback: () => Awaitable<R>): Promise<R> {
    await this.beginTransaction();
    let result: R;
    try {
      result = await callback();
      await this.commit();
    } catch (e) {
      await this.rollBack();
      throw e;
    }
    return result;
  }

  /**
   * Formats a string or template string arguments into an SQL string. This
   * method is intended to be used in conjunction with `get`, `all`, `exec`
   * and `raw` to format their arguments.
   *
   * Note: This method CANNOT be called as a template string tag.
   * @param parts An SQL string, or a template strings array.
   * @param values Contains the values of embedded expressions, if the `parts`
   *        parameter contains a template strings array. Otherwise, this value
   *        is ignored.
   * @return The formatted SQL.
   */
  protected formatSql(
    parts: Sql,
    values: any[],
    handleValue: (value: any) => string
  ): string {
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
        const value = values[i];
        if (value instanceof FieldSet) {
          sql += handleValue(value.toPlainObject());
        } else {
          sql += handleValue(value);
        }
      }
    }
    return sql;
  }

  /**
   * Logs the execution of a query. If `this.logQueries` is false, the query
   * is not logged.
   * @param sql The query to log.
   */
  protected logQuery(sql: string) {
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
   * @param extraArg An extra argument to pass into the `fetcher` callback,
   *        if required. If this method is called multiple times with the
   *        same `batchKey` but a different `extraArg`, only the value from
   *        the very first call is used.
   * @return A promise that resolves to the row matching `id`, or null if no
   *         row matches.
   */
  public batchOneToOne<K extends string | number, Row, E = undefined>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: K[], extraArg: E) => Awaitable<Row[]>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row | null> {
    let dataLoader: DataLoader<K, Row | null>;

    if (!this.dataLoaders[batchKey]) {
      dataLoader = new DataLoader<K, Row | null>(async ids => {
        const rows = await fetcher(this, ids, extraArg as E);
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
   * @param extraArg An extra argument to pass into the `fetcher` callback,
   *        if required. If this method is called multiple times with the
   *        same `batchKey` but a different `extraArg`, only the value from
   *        the very first call is used.
   * @return A promise that resolves to the rows matching `id`. If none were
   *         found, the array will be empty.
   */
  public batchOneToMany<K extends string | number, Row, E = undefined>(
    batchKey: string,
    id: K,
    fetcher: (db: this, ids: K[], extraArg?: E) => Awaitable<Row[]>,
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
  public clearCache<K extends string | number>(batchKey: string, id: K) {
    if (this.dataLoaders[batchKey]) {
      this.dataLoaders[batchKey].clear(id);
    }
  }
}

export default Adaptor;
