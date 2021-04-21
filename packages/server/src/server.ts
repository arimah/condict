import {GraphQLSchema} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';

import performStartupChecks from './startup-checks';
import {Connection, DataAccessor} from './database';
import {Context, getTypeDefs, getResolvers, getDirectives} from './graphql';
import {UserSession} from './model';
import {ServerConfig, Logger} from './types';

/**
 * Contains a symbol which, when passed into `CondictServer.getContextValue()`,
 * enables all mutations. This should only be passed in from trusted sources,
 * such as a local application that executes GraphQL operations.
 */
export const LocalSession = Symbol();

const validSession = () => true;
const noSession = () => false;

/**
 * Encapsulates the state and configuration of a Condict server. It contains
 * the executable GraphQL schema as well as a database connection. The method
 * `getSchema()` returns the GraphQL schema, and `getContextValue()` returns
 * a value suitable for use as the GraphQL execution context.
 *
 * Before using a server, it must be started using the `start()` method. This
 * performs various startup checks, and initializes the database if necessary.
 * The server should be stopped by calling `stop()` when no more requests are
 * to be sent to it.
 */
export default class CondictServer {
  private readonly logger: Logger;
  private readonly config: ServerConfig;
  private readonly schema: GraphQLSchema;
  private database: Connection | null = null;

  /**
   * Creates a new Condict server.
   * @param logger The logger to send diagnostic messages to.
   * @param config Server configuration options.
   */
  public constructor(logger: Logger, config: ServerConfig) {
    this.logger = logger;
    this.config = config;
    this.schema = makeExecutableSchema({
      typeDefs: getTypeDefs(),
      resolvers: getResolvers(),
      schemaDirectives: getDirectives(),
    });
  }

  /**
   * Gets the logger used by the server.
   * @return The logger used by the server.
   */
  public getLogger(): Logger {
    return this.logger;
  }

  /**
   * Gets the current server configuration.
   * @return The current server configuration.
   */
  public getConfig(): Readonly<ServerConfig> {
    return this.config;
  }

  /**
   * Gets the GraphQL schema.
   * @return The executable GraphQL schema.
   */
  public getSchema(): GraphQLSchema {
    return this.schema;
  }

  /**
   * Determines whether the server is running. A server must be started before
   * `getContextValue()` can be called.
   * @return True if the server is running.
   */
  public isRunning(): boolean {
    return this.database !== null;
  }

  /**
   * Starts the server. During startup, the server connects to the database,
   * performs startup checks, and initializes the database if necessary. If the
   * server is already running, this is a no-op.
   * @return A promise that resolves when the server is running and ready to
   *         accept operations. The promise is rejected if the server fails to
   *         start for any reason.
   */
  public async start(): Promise<void> {
    if (this.database) {
      return;
    }

    const {logger, config} = this;
    const database = new Connection(logger, config.database);
    await performStartupChecks(logger, config, database);
    this.database = database;
  }

  /**
   * Stops the server. If the server is already stopped, this is a no-op. It is
   * not safe to use the server after it has been stopped.
   * @return A promise that resolves when the server has been stopped. The
   *         server waits for all ongoing request to finish before shutting
   *         down completely.
   */
  public async stop(): Promise<void> {
    if (!this.database) {
      return;
    }
    await this.database.close();
  }

  /**
   * Gets a GraphQL execution context value. The `finish` method on the returned
   * value *must* be called at the end of the request. Otherwise, hard-to-debug
   * deadlocks *will* occur.
   * @param sessionId The current session ID. Without a valid session ID, most
   *        mutations will be unavailable. A session ID is obtained from the
   *        `logIn` mutation, which requires a user account. The `LocalSession`
   *        symbol enables all mutations, and should only be used for operations
   *        that come from trusted sources, e.g. an application that runs a
   *        non-HTTP server.
   * @return The GraphQL execution context value.
   */
  public async getContextValue(
    sessionId?: string | typeof LocalSession | null
  ): Promise<Context> {
    if (!this.database) {
      throw new Error('Server is not started.');
    }

    const {logger, database} = this;

    let db: DataAccessor | null = await database.getAccessor();

    const hasValidSession =
      sessionId === LocalSession
        ? validSession
        : sessionId == undefined
          ? noSession
          : () => db !== null && UserSession.verify(db, sessionId);

    return {
      db,
      logger,
      sessionId: typeof sessionId === 'string' ? sessionId : null,
      hasValidSession,
      finish: () => {
        if (db) {
          db.finish();
          db = null;
        }
      },
    };
  }
}
