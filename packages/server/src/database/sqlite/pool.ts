import Sqlite, {Database} from 'better-sqlite3';
import {createPool, Pool, Factory} from 'generic-pool';

import {Logger} from '../../types';

import Connection from './connection';
import registerUnicodeCollation from './unicode-collation';
import {Options} from './types';

// NB: "db" refers to instances of better-sqlite3's Database, and "connection"
// to our own wrapper.

export default class ConnectionPool {
  private readonly logger: Logger;
  private readonly pool: Pool<Database>;

  public constructor(logger: Logger, options: Options) {
    this.logger = logger;

    const factory: Factory<Database> = {
      create() {
        const db = new Sqlite(options.file);
        db.pragma('journal_mode = WAL');
        registerUnicodeCollation(db);
        return Promise.resolve(db);
      },
      destroy(db) {
        db.close();
        return Promise.resolve();
      },
      validate(db) {
        return Promise.resolve(db.open);
      },
    };
    this.pool = createPool(factory, {
      min: 1,
      max: 10,
    });
  }

  public getConnection(): PromiseLike<Connection> {
    return this.pool.acquire().then(connection =>
      new Connection(this.logger, connection, this.pool)
    );
  }

  public async close(): Promise<void> {
    await this.pool.drain();
    await this.pool.clear();
  }
}
