import DataLoader from 'dataloader';

import {DataReader, BatchFn} from './types';

/**
 * Implements per-request resource caching and batching. This class performs two
 * separate but closely related tasks:
 *
 * * It groups SQLs into batches, so resources can be fetched many at once;
 * * It keeps track of which resources have already been fetched, so we can
 *   avoid fetching rows multiple times.
 *
 * The batching methods implemented by this class correspond to those exposed by
 * DataReader, which are documented on that interface.
 */
export default class RequestCache {
  private db: DataReader;
  private readonly dataLoaders: Record<string, DataLoader<any, any>> = {};

  public constructor(db: DataReader) {
    this.db = db;
  }

  /**
   * Sets the data reader to be used by the request cache. This is called when
   * an exclusive writer lock is acquired, as we cannot safely read from any
   * other accessor as long as that lock is held. When the writer lock is
   * released, this function is called again to reset the database to a shared
   * reader.
   * @param db The new data reader.
   */
  public setDataReader(db: DataReader): void {
    this.db = db;
  }

  public batchOneToOne<K extends string | number, Row, E = undefined>(
    batchKey: string,
    id: K,
    fetcher: BatchFn<K, Row, E>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row | null> {
    let dataLoader: DataLoader<K, Row | null>;

    if (!this.dataLoaders[batchKey]) {
      dataLoader = new DataLoader<K, Row | null>(async ids => {
        const rows = await fetcher(this.db, ids, extraArg as E);
        const rowsById = rows.reduce((acc, row) => {
          acc.set(getRowId(row), row);
          return acc;
        }, new Map<K, Row>());
        return ids.map(id => rowsById.get(id) ?? null);
      });
      this.dataLoaders[batchKey] = dataLoader;
    } else {
      dataLoader = this.dataLoaders[batchKey] as DataLoader<K, Row | null>;
    }

    return dataLoader.load(id);
  }

  public batchOneToMany<K extends string | number, Row, E = void>(
    batchKey: string,
    id: K,
    fetcher: BatchFn<K, Row, E>,
    getRowId: (row: Row) => K,
    extraArg?: E
  ): Promise<Row[]> {
    let dataLoader: DataLoader<K, Row[]>;

    if (!this.dataLoaders[batchKey]) {
      dataLoader = new DataLoader<K, Row[]>(async ids => {
        const rows = await fetcher(this.db, ids, extraArg as E);

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
        return ids.map(id => rowsById.get(id) ?? []);
      });
      this.dataLoaders[batchKey] = dataLoader;
    } else {
      dataLoader = this.dataLoaders[batchKey] as DataLoader<K, Row[]>;
    }

    return dataLoader.load(id);
  }

  public clear<K extends string | number>(batchKey: string, id: K): void {
    this.dataLoaders[batchKey]?.clear(id);
  }
}
