import DataLoader from 'dataloader';
import {Logger} from 'winston';

import FieldSet from '../model/field-set';

import reindentQuery from './reindent-query';

interface DataLoaders {
  [k: string]: DataLoader<any, any>;
}

export type Sql = TemplateStringsArray | string;

export type Awaitable<T> = Promise<T> | T;

export interface ExecResult {
  insertId: number;
  affectedRows: number;
}

// TODO: Document

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
   * Fetches all rows that match a query. This method can be called directly
   * or used as a template string tag.
   * @param parts An SQL string, or a template strings array.
   * @param values When invoked with a template strings array, contains the
   *        values of embedded expressions.
   * @return An array of rows or a promise of such. If no rows match, the
   *         array will be empty.
   */
  public abstract all<Row>(parts: Sql, ...values: any[]): Awaitable<Row[]>;

  public abstract exec(parts: Sql, ...values: any[]): Awaitable<ExecResult>;

  public abstract beginTransaction(): Awaitable<void>;

  public abstract commit(): Awaitable<void>;

  public abstract rollBack(): Awaitable<void>;

  /**
   * Returns the database connection to its pool. The connection should not be
   * used by the request after calling this method.
   */
  public abstract release(): void;

  public abstract tableExists(name: string): Awaitable<boolean>;

  public abstract raw(parts: Sql, ...values: any[]): any;

  public formatSql(
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
    } else {
      dataLoader = this.dataLoaders[batchKey] as DataLoader<K, Row[]>;
    }

    return dataLoader.load(id);
  }

  public clearCache<K extends string | number>(batchKey: string, id: K) {
    if (this.dataLoaders[batchKey]) {
      this.dataLoaders[batchKey].clear(id);
    }
  }
}

export default Adaptor;
