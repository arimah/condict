import fs from 'fs';
import {Server} from 'http';

import {ApolloServer} from 'apollo-server';
import {Logger} from 'winston';

import performStartupChecks from './startup-checks';
import {LoggerOptions} from './create-logger';
import {createPool, generateSchema} from './database';
import Adaptor from './database/adaptor';
import {Pool as DatabasePool} from './database/types';
import reindentQuery from './database/reindent-query';
import exportDatabase from './database/export';
import importDatabase from './database/import';
import schema from './schema';
import {Context} from './schema/types';
import createModelResolvers from './model';

export type ServerConfig = {
  database: {
    type: string;
  };
  log: LoggerOptions;
};

// Generates a short, pseudo-random request ID.
// Exclusively for use in logs, so you can identify
// individual requests.
const generateRequestId = () => Math.random().toString(36).substr(2, 7);

class CondictServer {
  private readonly logger: Logger;
  private readonly config: ServerConfig;
  private readonly databasePool: DatabasePool;
  private server: ApolloServer | null;
  private httpServer: Server | null;

  public constructor(logger: Logger, config: ServerConfig) {
    if (!config.database) {
      throw new Error('Database configuration missing');
    }

    this.logger = logger;
    this.config = config;

    this.databasePool = createPool(logger, config.database);

    this.server = null;
    this.httpServer = null;
  }

  private createApolloServer() {
    if (this.server) {
      return;
    }

    this.server = new ApolloServer({
      typeDefs: schema.typeDefs,
      resolvers: schema.resolvers,
      context: async ({res}): Promise<Context> => {
        const requestId = generateRequestId();

        const startTime = Date.now();
        this.logger.info(`Start request ${requestId}`);

        let db: Adaptor | undefined;
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

        const modelResolvers = createModelResolvers(db, this.logger);

        return {
          db,
          logger: this.logger,
          ...modelResolvers,
        };
      },
    });
  }

  public async start() {
    const {logger, config, databasePool} = this;
    logger.info('Condict is starting!');

    this.createApolloServer();
    await performStartupChecks(logger, config, databasePool);

    const {url, server} = await (this.server as ApolloServer).listen();
    this.httpServer = server;

    return {url};
  }

  public export(outputFile: string) {
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

  public import(inputFile: string) {
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

  public viewTableSchema(tableName: string | null) {
    // The --view-table-schema option is not really used outside a terminal
    // environment, so we assume we can safely print directly to stdout and
    // stderr here.
    const schema = generateSchema(this.config.database.type);

    let tableFound = false;
    for (const [name, statements] of schema) {
      if (tableName !== null) {
        if (name !== tableName) {
          continue;
        } else {
          tableFound = true;
        }
      }

      console.log(`-- Schema for ${name}:`);
      console.log(statements.map(reindentQuery).join(';\n') + ';\n');

      if (tableFound) {
        break;
      }
    }

    if (tableName !== null && !tableFound) {
      console.error(`Table not found: ${tableName}`);
    }
  }

  public close() {
    if (this.httpServer) {
      this.logger.info('Stopping HTTP server...');
      this.httpServer.close();
    }
    return this.databasePool.close();
  }
}

export const createServer = (logger: Logger, config: ServerConfig) =>
  new CondictServer(logger, config);
