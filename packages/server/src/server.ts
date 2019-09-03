import {GraphQLSchema} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';
import {Logger} from 'winston';

import performStartupChecks from './startup-checks';
import {createPool} from './database';
import Adaptor from './database/adaptor';
import {Pool as DatabasePool} from './database/types';
import {getTypeDefs, getResolvers, getDirectives, Context} from './graphql';
import createModelResolvers, {Resolvers} from './model';
import {ServerConfig} from './types';

export type ContextResult = {
  context: Context;
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
      typeDefs: getTypeDefs(),
      resolvers: getResolvers(),
      schemaDirectives: getDirectives(),
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
}
