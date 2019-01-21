const Sqlite = require('better-sqlite3');
const genericPool = require('generic-pool');

const SqliteAdaptor = require('./adaptor');
const generateSchema = require('./schema');

class DatabasePool {
  constructor(logger, options) {
    this.logger = logger;

    const factory = {
      create() {
        const connection = new Sqlite(options.file);
        connection.pragma('journal_mode = WAL');
        return connection;
      },
      destroy(connection) {
        connection.close();
      },
    };
    this.pool = genericPool.createPool(factory, {
      min: 1,
      max: 10,
    });
  }

  getConnection() {
    return this.pool.acquire().then(connection =>
      new SqliteAdaptor(this.logger, connection, this.pool)
    );
  }

  async close() {
    await this.pool.drain();
    this.pool.clear();
  }
}

module.exports = {
  createPool: (logger, options) => new DatabasePool(logger, options),
  generateSchema,
};
