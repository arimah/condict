const fs = require('fs');

const {ApolloServer} = require('apollo-server');

const performStartupChecks = require('./startup-checks');
const database = require('./database');
const schema = require('./schema');
const model = require('./model');
const exportDatabase = require('./utils/export');
const importDatabase = require('./utils/import');

const generateRequestId = () => {
  // Generates a short, pseudo-random request ID.
  // Exclusively for use in logs, so you can identify
  // individual requests.
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let id = '';
  while (id.length < 5) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
};

class CondictServer {
  constructor(logger, config) {
    if (!config.database) {
      throw new Error('Database configuration missing');
    }

    this.logger = logger;
    this.config = config;

    this.databasePool = database.createPool(logger, config.database);

    this.server = null;
    this.httpServer = null;
  }

  createApolloServer() {
    if (this.server) {
      return;
    }

    this.server = new ApolloServer({
      typeDefs: schema.typeDefs,
      resolvers: schema.resolvers,
      context: async ({res}) => {
        const requestId = generateRequestId();

        const startTime = Date.now();
        this.logger.info(`Start request ${requestId}`);

        let db;
        res.on('finish', () => {
          this.logger.info(
            `Request ${requestId} finished in ${Date.now() - startTime} ms`
          );
          // Return the database connection to the pool after the request.
          if (db) {
            db.release();
          }
        });
        db = await this.databasePool.getConnection();

        const modelResolver = model.createResolver(db, this.logger);

        return {
          db,
          logger: this.logger,
          ...modelResolver
        };
      },
    });
  }

  async start() {
    const {logger, config, databasePool} = this;
    logger.info('Condict is starting!');

    this.createApolloServer();
    await performStartupChecks(logger, config, databasePool);

    const {url, server} = await this.server.listen();
    this.httpServer = server;

    return {url};
  }

  export(outputFile) {
    const {logger, config, databasePool} = this;

    // Mixing Node's ancient async APIs with Promises... gross.
    return new Promise((resolve, reject) => {
      const outputStream = fs.createWriteStream(outputFile);
      // If anything goes wrong with the stream, e.g. the disk is unplugged
      // or whatever, we have to reject the outer promise.
      outputStream.once('error', err => reject(err));

      // We have to run startup checks before exporting the database, as this
      // will verify the schema and other nice things.
      performStartupChecks(logger, config, databasePool)
        .then(() => databasePool.getConnection())
        .then(db => exportDatabase(logger, db, outputStream))
        .then(() => {
          // Have to wait until the file has been fully written, otherwise
          // process.exit() might result in partial data.
          outputStream.end(resolve);
        })
        .catch(err => reject(err));
    });
  }

  import(inputFile) {
    const {logger, config, databasePool} = this;

    // Mixing Node's ancient async APIs with Promises... gross.
    return new Promise((resolve, reject) => {
      const inputStream = fs.createReadStream(inputFile);
      // If anything goes wrong with the stream, e.g. the disk is unplugged
      // or whatever, we have to reject the outer promise.
      inputStream.once('error', err => reject(err));

      // We have to run startup checks before importing the database, as this
      // will verify the schema and other nice things.
      performStartupChecks(logger, config, databasePool)
        .then(() => databasePool.getConnection())
        .then(db => importDatabase(logger, db, inputStream))
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  async close() {
    if (this.httpServer) {
      this.logger.info('Stopping HTTP server...');
      this.httpServer.close();
    }
    return this.databasePool.close();
  }
}

module.exports = {
  createServer: (logger, config) => new CondictServer(logger, config),
};
