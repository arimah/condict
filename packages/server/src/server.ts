import {GraphQLSchema} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';

import {createPrefixLogger} from './create-logger';
import performStartupChecks from './startup-checks';
import {Connection, DataAccessor} from './database';
import {Context, getTypeDefs, getResolvers, getDirectives} from './graphql';
import {
  User as UserModel,
  UserSession,
  UserMut,
  UserId,
  UserRow,
  NewUserInput,
  EditUserInput,
} from './model';
import {ServerConfig, Logger} from './types';

/**
 * Contains a symbol which, when passed into `CondictServer.getContextValue()`,
 * enables all mutations. This should only be passed in from trusted sources,
 * such as a local application that executes GraphQL operations.
 */
export const LocalSession = Symbol();

/**
 * Contains information about a user. Used by the user management methods on
 * the server object.
 */
export interface User {
  /** The user ID. */
  readonly id: UserId;
  /** The user name. */
  readonly name: string;
}

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
   * Gets the server's database connection. If the server is not started, the
   * method throws an error.
   * @return The current database connection.
   */
  public getDatabase(): Connection {
    if (!this.database) {
      throw new Error('The server is not running');
    }
    return this.database;
  }

  /**
   * Determines whether the server is running. A server must be started before
   * most methods can be called.
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
    this.database = null;
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
    sessionId?: string | typeof LocalSession | null,
    requestId?: string
  ): Promise<Context> {
    const database = this.getDatabase();
    let {logger} = this;

    if (requestId) {
      logger = createPrefixLogger(logger, `[${requestId}]`);
    }

    let db: DataAccessor | null = await database.getAccessor(logger);

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
      requestId: requestId ?? null,
      hasValidSession,
      finish: () => {
        if (db) {
          db.finish();
          db = null;
        }
      },
    };
  }

  /**
   * Gets the user with the specified id.
   * @param id The user ID to look up.
   * @return A promise that resolves to the user with the specified ID, or null
   *         if the user was not found. The promise is rejected if the server is
   *         not running.
   */
  public async getUserById(id: UserId): Promise<User | null> {
    const database = this.getDatabase();

    const db = await database.getAccessor();
    try {
      return UserModel.byId(db, id);
    } finally {
      db.finish();
    }
  }

  /**
   * Gets the user with the specified name.
   * @param name The user name to look up.
   * @return A promise that resolves to the user with the specified name, or
   *         null if the user was not found. The promise is rejected if the
   *         server is not running.
   */
  public async getUserByName(name: string): Promise<User | null> {
    const database = this.getDatabase();

    const db = await database.getAccessor();
    try {
      return UserModel.byName(db, name);
    } finally {
      db.finish();
    }
  }

  /**
   * Adds a user to the database. When the promise has resolved, it is possible
   * to log in as the user with the supplied credentials in GraphQL using the
   * `logIn` mutation.
   * @param data New user data.
   * @return A promise that resolves with details of the newly created user. The
   *         promise is rejected if the name or password is invalid, if there
   *         is already a user with the specified name, or if the server is not
   *         started.
   */
  public async addUser(data: NewUserInput): Promise<User> {
    const database = this.getDatabase();

    const db = await database.getAccessor();
    let user: UserRow;
    try {
      user = await UserMut.insert(db, data);
    } finally {
      db.finish();
    }
    return {id: user.id, name: user.name};
  }

  /**
   * Edits the user with the specified ID. This method can be used to rename
   * the user and/or change their password. Existing sessions are *not* closed
   * when a user is edited.
   * @param id The ID of the user to update.
   * @param data User data to update.
   * @return A promise that resolves when the user has been updated. The promise
   *         is rejected if the new name or new password is invalid, if the user
   *         is being renamed and the name is taken by an existing user, or if
   *         the server is not started.
   */
  public async editUser(id: UserId, data: EditUserInput): Promise<User> {
    const database = this.getDatabase();

    const db = await database.getAccessor();
    let user: UserRow;
    try {
      user = await UserMut.update(db, id, data);
    } finally {
      db.finish();
    }
    return {id: user.id, name: user.name};
  }

  /**
   * Deletes the user with the specified ID. All of the user's sessions are
   * terminated, and it is not possible to log in as the user once the promise
   * has resolved.
   * @param id The ID of the user to delete.
   * @return A promise that resolves when the user has been deleted. If the
   *         value is true, the user was found and deleted; if false, the user
   *         could not be found. The promise is rejected if the server is not
   *         running or an unexpected database error occurs.
   */
  public async deleteUser(id: UserId): Promise<boolean> {
    const database = this.getDatabase();

    const db = await database.getAccessor();
    try {
      return await UserMut.delete(db, id);
    } finally {
      db.finish();
    }
  }
}
