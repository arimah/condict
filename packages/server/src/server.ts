import fs from 'fs';
import {Server} from 'http';

import {ApolloServer} from 'apollo-server';
import {Logger} from 'winston';

import performStartupChecks from './startup-checks';
import {createPool, generateSchema} from './database';
import Adaptor from './database/adaptor';
import {Pool as DatabasePool} from './database/types';
import reindentQuery from './database/reindent-query';
import exportDatabase from './database/export';
import importDatabase from './database/import';
import * as graphql from './graphql';
import createModelResolvers from './model';
import {ServerConfig} from './types';

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
      typeDefs: graphql.getTypeDefs(),
      resolvers: graphql.getResolvers(),
      schemaDirectives: graphql.getDirectives(),
      context: async ({res}): Promise<graphql.Context> => {
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

  public async start(): Promise<{url: string}> {
    const {logger, config, databasePool} = this;
    logger.info('Condict is starting!');

    this.createApolloServer();
    await performStartupChecks(logger, config, databasePool);

    const {url, server} = await (this.server as ApolloServer).listen();
    this.httpServer = server;

    return {url};
  }

  public export(outputFile: string): Promise<void> {
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

  public import(inputFile: string): Promise<void> {
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

  public getTableSchema(tableName: string | null): string | null {
    let schema = generateSchema(this.config.database.type);

    if (tableName !== null) {
      schema = schema.filter(([name]) => name === tableName);
    }

    if (schema.length === 0) {
      return null;
    }

    return schema
      .map(([name, statements]) =>
        [
          `-- Schema for ${name}:`,
          ...statements.map(stmt => `${reindentQuery(stmt)};`),
        ].join('\n')
      )
      .join('\n\n');
  }

  public async close(): Promise<void> {
    if (this.httpServer) {
      this.logger.info('Stopping HTTP server...');
      this.httpServer.close();
    }
    await this.databasePool.close();
  }
}

export default (logger: Logger, config: ServerConfig) =>
  new CondictServer(logger, config);
