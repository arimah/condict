import fs from 'fs';

import {GraphQLSchema} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';
import {Logger} from 'winston';

import performStartupChecks from './startup-checks';
import {createPool, generateSchema} from './database';
import Adaptor from './database/adaptor';
import {Pool as DatabasePool} from './database/types';
import reindentQuery from './database/reindent-query';
import exportDatabase from './database/export';
import importDatabase from './database/import';
import * as graphql from './graphql';
import createModelResolvers, {Resolvers} from './model';
import {ServerConfig} from './types';

export type ContextResult = {
  context: graphql.Context;
  finish: () => void;
};

export default class CondictServer {
  private readonly logger: Logger;
  private readonly config: ServerConfig;
  private readonly databasePool: DatabasePool;
  private readonly schema: GraphQLSchema;
  private started: boolean = false;

  public constructor(logger: Logger, config: ServerConfig) {
    if (!config.database) {
      throw new Error('Database configuration missing');
    }

    this.logger = logger;
    this.config = config;
    this.databasePool = createPool(logger, config.database);
    this.schema = makeExecutableSchema({
      typeDefs: graphql.getTypeDefs(),
      resolvers: graphql.getResolvers(),
      schemaDirectives: graphql.getDirectives(),
    });
  }

  public async start(): Promise<void> {
    if (this.started) {
      return;
    }

    const {logger, config, databasePool} = this;
    await performStartupChecks(logger, config, databasePool);
    this.started = true;
  }

  public async stop(): Promise<void> {
    if (!this.started) {
      return;
    }
    await this.databasePool.close();
    this.started = false;
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public getConfig(): Readonly<ServerConfig> {
    return this.config;
  }

  public getDatabasePool(): DatabasePool {
    return this.databasePool;
  }

  public getSchema(): GraphQLSchema {
    return this.schema;
  }

  public async getContextValue(): Promise<ContextResult> {
    if (!this.started) {
      throw new Error('Server is not started.');
    }

    const {logger, databasePool} = this;

    let modelResolvers: Resolvers | undefined;
    let db: Adaptor | undefined;
    try {
      db = await databasePool.getConnection();
      modelResolvers = createModelResolvers(db, logger);
    } catch (e) {
      if (db) {
        db.release();
      }
      throw e;
    }

    return {
      context: {
        db,
        logger,
        ...modelResolvers,
      },
      finish: () => {
        if (db) {
          db.release();
        }
      },
    };
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
}
