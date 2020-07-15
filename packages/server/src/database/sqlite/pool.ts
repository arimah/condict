import Sqlite, {Database} from 'better-sqlite3';
import {createPool, Pool, Factory} from 'generic-pool';

import {Logger} from '../../types';

import SqliteAdaptor from './connection';
import {Options} from './types';

export default class ConnectionPool {
  private readonly logger: Logger;
  private readonly pool: Pool<Database>;

  public constructor(logger: Logger, options: Options) {
    this.logger = logger;

    const factory: Factory<Database> = {
      create() {
        const connection = new Sqlite(options.file);
        connection.pragma('journal_mode = WAL');
        return Promise.resolve(connection);
      },
      destroy(connection) {
        connection.close();
        return Promise.resolve();
      },
      validate(connection) {
        return Promise.resolve(connection.open);
      },
    };
    this.pool = createPool(factory, {
      min: 1,
      max: 10,
    });
  }

  public getConnection(): PromiseLike<SqliteAdaptor> {
    return this.pool.acquire().then(connection =>
      new SqliteAdaptor(this.logger, connection, this.pool)
    );
  }

  public async close(): Promise<void> {
    await this.pool.drain();
    this.pool.clear();
  }
}
