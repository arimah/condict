import Sqlite from 'better-sqlite3';
import {
  createPool as createGenericPool,
  Pool,
  Factory,
} from 'generic-pool';
import {Logger} from 'winston';

import {Driver} from '../types';

import SqliteAdaptor from './adaptor';
import generateSchema from './schema';

export type SqliteOptions = {
  file: string;
};

class DatabasePool {
  private readonly logger: Logger;
  private readonly pool: Pool<Sqlite.Database>;

  public constructor(logger: Logger, options: SqliteOptions) {
    this.logger = logger;

    const factory: Factory<Sqlite.Database> = {
      async create() {
        const connection = new Sqlite(options.file);
        connection.pragma('journal_mode = WAL');
        return connection;
      },
      async destroy(connection) {
        connection.close();
      },
    };
    this.pool = createGenericPool(factory, {
      min: 1,
      max: 10,
    });
  }

  public getConnection(): PromiseLike<SqliteAdaptor> {
    return this.pool.acquire().then(connection =>
      new SqliteAdaptor(this.logger, connection, this.pool)
    );
  }

  public async close() {
    await this.pool.drain();
    this.pool.clear();
  }
}

const engine: Driver = {
  createPool: (logger: Logger, options: any) =>
    new DatabasePool(logger, options as SqliteOptions),
  generateSchema,
};

export default engine;
