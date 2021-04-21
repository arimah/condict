import Sqlite, {Database} from 'better-sqlite3';

import {Logger} from '../../types';

import reindentQuery from '../reindent-query';

import Accessor from './accessor';
import RwLock from './rwlock';
import registerUnicodeCollation from './unicode-collation';
import {Options, DataAccessor, SqlLogger} from './types';

// NB: "db" refers to instances of better-sqlite3's Database, and "connection"
// to our own wrapper.

/**
 * Manages access to a shared SQLite connection. The server uses a single handle
 * to the SQLite database, which is shared across all requests. This class is
 * used to serialize modifications of the database: it permits any number of
 * concurrent readers, but only one writer, and only when there are no readers.
 * See the documentation of Accessor and RwLock for details.
 */
export default class Connection {
  private readonly logger: Logger;
  private readonly db: Database;
  private readonly lock: RwLock;
  private readonly logSql: SqlLogger;

  public constructor(logger: Logger, options: Options) {
    this.logger = logger;

    const db = new Sqlite(options.file);
    db.pragma('journal_mode = WAL');
    registerUnicodeCollation(db);
    this.db = db;

    this.lock = new RwLock();

    if (process.env.DEBUG_QUERIES === '1') {
      this.logSql = sql => {
        if (/^\s*$/.test(sql)) {
          this.logger.warn('Empty query?!');
        } else {
          const reindentedSql = reindentQuery(sql);
          this.logger.debug(`Query:\n${reindentedSql}`);
        }
      };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.logSql = () => { };
    }
  }

  /**
   * Gets a connection to the database. The connection has shared read-only
   * access by default, and exclusive read-write access must be requested
   * through the connection object.
   * @return A promise that resolves with the database connection. The promise
   *         is rejected if the connection is closed before the accessor could
   *         be acquired.
   */
  public async getAccessor(): Promise<DataAccessor> {
    const token = await this.lock.reader();
    return new Accessor(this.db, token, this.logSql);
  }

  public async close(): Promise<void> {
    await this.lock.close();
    this.db.close();
  }
}
