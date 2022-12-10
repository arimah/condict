# @condict/server

This package implements Condict's data storage backend along with its [GraphQL][] server. The server is responsible for fetching data through GraphQL queries, and updating the dictionary through GraphQL mutations. The server is the ultimate authority on the contents of a dictionary. This package does _not_ come with a GUI frontend.

This package exposes APIs for creating and interacting with an embedded server, chiefly the [`CondictServer`](#condictserver-1) class, along with various functions. This package does _not_ come with a standalone HTTP server; it is exclusively a set of APIs. For a basic standalone HTTP server, use [@condict/http-server](../http-server).

Due to using [SQLite][] as its only backing store, this package is _not_ suitable for distributed systems with extremely high throughput requirements. Though every effort has been made to keep Condict performant, a single server is still limited in its capabilities. Sharing SQLite databases through networked file systems is not recommended. Additionally, SQLite transactions lock the entire database, meaning that mutations cannot occur in parallel. This limits the number of mutations per second, hence this package should not be used when a very large number of concurrent writers are needed.

Condict makes use of several packages with native bindings, and even implements some of its own. Building the server requires a working installation of [node-gyp][].

This file does not document the GraphQL queries and mutations that Condict exposes. For that, examine the schema of a running server through introspection queries, or visit the source files in the [graphql-schema](../../graphql-schema/) folder.

## API

* [Examples](#examples)
* [`CondictServer`](#condictserver-1)
* [`createLogger()`](#createlogger)
* [`executeLocalOperation()`](#executelocaloperation)

---

The following section summarises the main exports of the Condict server API. It documents the most important features of the API, rather than literally every interface.

### Examples

[Create a logger](#createlogger) and start a new [`CondictServer`](#condictserver-1):

```typescript
import {CondictServer, ServerConfig, LoggerOptions} from '@condict/server';

const serverConfig: ServerConfig = {
  database: {
    file: 'dictionary.sqlite',
  },
};

const logConfig: LoggerOptions = {
  // Print debug messages to stdout
  stdout: 'debug',
  files: [
    // Save errors in error.log
    {path: 'error.log', level: 'error'},
  ]
};

async function main() {
  const logger = createLogger(logConfig);
  const server = new CondictServer(logger, ServerConfig);

  try {
    await server.start();
    // Now the server can be used
  } finally {
    // Stop the server when it's no longer needed.
    await server.stop();
  }
}
```

[Execute local operations](#executelocaloperation) against an existing server:

```typescript
import {CondictServer, executeLocalOperation} from '@condict/server';

async function fetchLanguage(server: CondictServer, id: number) {
  const result = await executeLocalOperation(
    server,
    // The GraphQL query
    `query($languageId: LanguageId!) {
      language(id: $languageId) {
        id
        name
      }
    }`,
    // Variable values
    {languageId: id}
  );

  // result contains fetched data under 'data', errors under 'errors'.
  return result.data?.language;
}
```

### `CondictServer`

* [constructor](#condictserver-constructor)
* [data getter funtions](#condictserver-data-getter-functions)
* [`CondictServer.prototype.start()`](#condictserverprototypestart)
* [`CondictServer.prototype.stop()`](#condictserverprototypestop)
* [`CondictServer.prototype.getContextValue()`](#condictserverprototypegetcontextvalue)
* [`CondictServer.prototype.getUserById()`](#condictserverprototypegetuserbyid)
* [`CondictServer.prototype.getUserByName()`](#condictserverprototypegetuserbyname)
* [`CondictServer.prototype.addUser()`](#condictserverprototypeadduser)
* [`CondictServer.prototype.editUser()`](#condictserverprototypeedituser)
* [`CondictServer.prototype.deleteUser()`](#condictserverprototypedeleteuser)

---

The `CondictServer` class is the heart of the Condict server. It implements resolvers for every field and mutation in the GraphQL schema, and manages the database connection. The server does not itself execute GraphQL queries, however. Instead it exposes methods for acquiring the executable schema and for acquiring an execution context. This class also does not contain an HTTP server; [`CondictHttpServer` from @condict/http-server][condict-http-server] can be used for that.

See [the examples above](#examples) for sample uses of this class.

#### `CondictServer` constructor

> `constructor(logger: Logger, config: ServerConfig)`

Creates a new `CondictServer` with the specified logger and server configuration.

The logger can be any object that implements the `Logger` interface. At minimum, it requires methods named `error`, `warn`, `info`, `verbose` and `debug`.

#### `CondictServer`: data getter functions

* `getLogger(): Logger`: Gets the logger used by the server.
* `getConfig(): Readonly<ServerConfig>`: Gets the current server configuration.
* `getSchema(): GraphQLSchema`: Gets the GraphQL schema. The schema returned by this function is executable; that is, all queries and mutations have resolvers.
* `getDatabase(): Connection`: Gets the server's database connection. If the server is not started, this method throws an error.
* `isRunning(): boolean`: Determines whether the server is running. Most server methods require the server to be [started](#condictserverprototypestart).

#### `CondictServer.prototype.start()`

> `start(): Promise<void>`

Starts the server. During startup, the server connects to the database, performs startup checks, and initializes the database (with tables, indexes and certain default metadata) if necessary. If the database configuration mentions a file that does not exist, SQLite will attempt to create it.

The returned promise resolves when the server is fully started and ready to accept work. The promise is rejected if the server fails to start for any reason.

If the server is already running, this is a no-op, and the promise resolves immediately.

#### `CondictServer.prototype.stop()`

> `stop(): Promise<void>`

Gracefully stops the server. The server will wait for ongoing queries and mutations to finish, then close the database connection. It is not safe to use the server after it has been stopped.

The returned promise resolves when the server has shut down fully. If any error occurs during shutdown, the promise is rejected, and the server object should not be used.

#### `CondictServer.prototype.getContextValue()`

> `getContextValue(sessionId?: string | typeof LocalSession | null, requestId?: string): Promise<Context>`

Gets a GraphQL execution context value. This value is required when executing GraphQL operations. The [`executeLocalOperation()`](#executelocaloperation) function calls this method internally.

The `sessionId` parameter is used for mutation authentication. It takes one of the following values:

* A session ID string, as returned by the `logIn` mutation. The session ID is valid if it matches an ongoing user session; otherwise, the request is unauthenticated.
* The symbol `LocalSession`. This indicates that the operation is executed in a trusted context, for example when the server is embedded in an application. All mutations are permitted.
* `null` or `undefined`, which means the request is unauthenticated. Most mutations are prohibited without authentication.

The `requestId` parameter takes a string that identifies the request. It is prepended to log messages produced by the context's logger.

The returned promise resolves once the context is available. If the server is in the process of shutting down, the promise is rejected.

The `finish` method on the returned value *must* be called at the end of the request. Otherwise, hard-to-debug deadlocks *will* occur.

#### `CondictServer.prototype.getUserById()`

> `getUserById(id: UserId): Promise<User | null>`

Gets the user with the specified ID. The returned promise resolves to an object with user details, or null if the user was not found. The promise is rejected if the server is not [started](#condictserverprototypestart).

A `number` value can be cast directly to a `UserId`: `server.getUserId(myId as UserId)`.

#### `CondictServer.prototype.getUserByName()`

> `getUserByName(name: string): Promise<User | null>`

Gets the user with the specified name. The returned promise resolves to an object with user details, or null if the user was not found. The promise is rejected if the server is not [started](#condictserverprototypestart).

#### `CondictServer.prototype.addUser()`

> `addUser(data: NewUserInput): Promise<User>`

Adds a user to the database. When the promise has resolved, it is possible to log in as the user with the supplied credentials in GraphQL using the `logIn` mutation.

The returned promise resolves with details of the newly created user. The promise is rejected if the name or password is invalid, if there is already a user with the specified name, or if the server is not [started](#condictserverprototypestart).

#### `CondictServer.prototype.editUser()`

> `editUser(id: UserId, data: EditUserInput): Promise<User>`

Edits the user with the specified ID. This method can be used to rename the user and/or change their password. Editing a user does _not_ invalidate existing sessions.

The returned promise resolves with updated user details when the user has been updated. The promise is rejected if the new name or new password is invalid, if the user is being renamed and the name is taken by an existing user, or if the server is not [started](#condictserverprototypestart).

#### `CondictServer.prototype.logOutUser()`

> `logOutUser(id: UserId): Promise<void>`

Terminates every session associated with the specified user. This method is used to force the user to log out, for example in case credentials have been compromised.

The returned promise resolves when the user has been logged out of all sessions. The promise is rejected if the server is not [started](#condictserverprototypestart) or an unexpected database error occurs.

_**Note:** The name is capitalised as `logOutUser`, not `logoutUser`._

#### `CondictServer.prototype.deleteUser()`

> `deleteUser(id: UserId): Promise<boolean>`

Deletes the user with the specified ID. All of the user's sessions are terminated, and it is not possible to log in as the user once the promise has resolved.

The returned promise resolves with `true` if the user was found and deleted; if `false`, the user could not be found. The promise is rejected if the server is not [started](#condictserverprototypestart) or an unexpected database error occurs.

### `createLogger()`

> `createLogger(config: LoggerOptions): Logger`

Creates a logger from the specified logger options. The logger options determine which levels are output where. Condict's built-in logger uses the [winston][] library. The resulting logger will be configured with the following levels, from most to least severe:

1. `error`
2. `warn`
3. `info`
4. `verbose`
5. `debug`

Output to log files uses a simple plain-text format that is not super friendly to machine parsing. If you need your log output in a different format, create your own logger.

### `executeLocalOperation()`

> `executeLocalOperation(server: CondictServer, operation: string, variableValues: Record<string, any> | null): Promise<ExecutionResult<unknown>>`

Executes a [GraphQL][] operation against a [Condict server](#condictserver-1). The server must be [started](#condictserverprototypestart) before calling this function.

The `operation` parameter takes the GraphQL operation (query or mutation) to execute. Documents with multiple named operations are not supported.

The `variableValues` parameter receives values for each variable in the operation.

The returned promise resolves with the result of the execution, which is an object containing at minimum an object under `data`, and any errors that may have occurred under `errors`. See [the GraphQL website][graphql] for details. The promise is rejected only if an unexpected error happens (e.g. lost database connection, bug in Condict).

## Users

When Condict runs as an HTTP server, it is necessary to authenticate mutations. The [`CondictServer`](#condictserver-1) class and the [command-line interface][condict-server-cli] both expose functions for adding, editing and deleting users.

Users are identified by a name and a password. No other information is stored for users. Passwords are hashed using 12-round [bcrypt][] before storage. There are no permissions; all users can modify anything in the dictionary.

There are three [GraphQL][] mutations that can be executed without authentication:

* The `logIn` mutation is used for authentication. If successful, it returns a session ID. The default [Condict HTTP server][condict-http-server] accepts the the session ID through the custom request header `X-Condict-Session-Id`. Custom servers can accept the session ID in any way they wish, and pass it into [`getContextValue()`](#condictserverprototypegetcontextvalue).
* The `resumeSession` mutation verifies the current session ID, returning session data if successful, or an error if the session is invalid.
* The `logOut` mutation terminates the current session. Subsequent mutations that use the same session ID are rejected.

[condict-http-server]: ../http-server#condicthttpserver
[condict-server-cli]: ../http-server#cli
[graphql]: https://graphql.org/
[sqlite]: https://sqlite.org/
[node-gyp]: https://github.com/nodejs/node-gyp#readme
[winston]: https://www.npmjs.com/package/winston
[bcrypt]: https://en.wikipedia.org/wiki/Bcrypt
