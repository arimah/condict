import {GraphQLSchema} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';

import performStartupChecks from './startup-checks';
import {Connection, ConnectionPool} from './database';
import {Context, getTypeDefs, getResolvers, getDirectives} from './graphql';
import {UserSession} from './model';
import {ServerConfig, Logger} from './types';

export interface ContextResult {
  readonly context: Context;
  readonly finish: () => void;
}

export const LocalSession = Symbol();

const validSession = () => true;
const noSession = () => false;

export default class CondictServer {
  private readonly logger: Logger;
  private readonly config: ServerConfig;
  private readonly databasePool: ConnectionPool;
  private readonly schema: GraphQLSchema;
  private started = false;

  public constructor(logger: Logger, config: ServerConfig) {
    this.logger = logger;
    this.config = config;
    this.databasePool = new ConnectionPool(logger, config.database);
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

  public getDatabasePool(): ConnectionPool {
    return this.databasePool;
  }

  public getSchema(): GraphQLSchema {
    return this.schema;
  }

  public async getContextValue(
    sessionId?: string | typeof LocalSession | null
  ): Promise<ContextResult> {
    if (!this.started) {
      throw new Error('Server is not started.');
    }

    const {logger, databasePool} = this;

    let db: Connection | null = null;
    try {
      db = await databasePool.getConnection();
    } catch (e) {
      if (db) {
        db.release();
        db = null;
      }
      throw e;
    }

    const hasValidSession =
      sessionId === LocalSession
        ? validSession
        : sessionId == undefined
          ? noSession
          : () => db !== null && UserSession.verify(db, sessionId);

    return {
      context: {
        db,
        logger,
        sessionId: typeof sessionId === 'string' ? sessionId : null,
        hasValidSession,
      },
      finish: () => {
        if (db) {
          db.release();
          db = null;
        }
      },
    };
  }
}
