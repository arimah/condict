# @condict/http-server

This package implements a standalone HTTP server with a Condict GraphQL API. The server can be started programmatically through the [`CondictHttpServer` class](#condicthttpserver), or through the [`condict-server` command-line interface](#cli), and supports minimal [configuration](#configuration). The server uses an [Apollo server][apollo-server] to implement the GraphQL protocol, and the schema and its resolvers come from [@condict/server](../server).

This file does not document the GraphQL queries and mutations that Condict exposes. For that, examine the schema of a running server through introspection queries, or visit the source files in the [graphql-schema](../../graphql-schema/) folder.

## API

* [Examples](#examples)
* [`CondictHttpServer`](#condicthttpserver)
* [`loadConfigFile()`](#loadconfigfile)

### Examples

[Load a config file](#loadconfigfile) and [start a server](#condicthttpserverstartnew):

```typescript
import {CondictHttpServer, loadConfigFile} from '@condict/http-server';
import {CondictServer, createLogger} from '@condict/server';

async function main() {
  const config = loadConfigFile('config.json');
  const logger = createLogger(config.log);
  const server = new CondictServer(logger, config);
  const httpServer = await CondictHttpServer.startNew(server, config.http);
  // The HTTP server is now ready to accept connections

  // Close the server when it's no longer needed
  await httpServer.stop();
}
```

### `CondictHttpServer`

* [`CondictHttpServer.startNew()`](#condicthttpserverstartnew)
* [`CondictHttpServer.prototype.stop()`](#condicthttpserverprototypestop)

---

The `CondictHttpServer` class is a standalone HTTP server with minimal configuration. It uses an [`ApolloServer`][apollo-server] under the hood, and uses a [`CondictServer`][condict-server] to manage database access, get the executable schema, and other tasks. This class is designed to be easy to use, not to be flexible or perfect for every situation.

Full documentation on the underlying server is available on the [Apollo server][apollo-server] website. To summarise:

* Condict's HTTP server listens on its configured port (default: 4000).
* The route `GET /` returns a [GraphQL][] sandbox, where you can execute operations and explore the schema.
* The route `POST /` accepts [GraphQL][] operations in accordance with the spec.
* The route `/events` is used for WebSocket connections that wish to receive real-time events with dictionary changes. This is _not_ a GraphQL subscription, but a custom solution. The upgrade request must include appropriate authentication headers: unauthenticated users cannot subscribe to dictionary events.

In addition, for user authentication, the default HTTP server uses the custom request header `X-Condict-Session-Id`, which is set to the session ID returned by the `logIn` mutation. See more under [@condict/server > Users][condict-server-users].

#### `CondictHttpServer.startNew()`

> `startNew(server: CondictServer, config: HttpOptions): Promise<CondictHttpServer>`

Creates a new `CondictHttpServer` from an underlying [Condict server][condict-server] and the specified HTTP options. The HTTP server will use the same logger as the Condict server. If the `CondictServer` is not already started, this function will start it. When the promise resolves, the server will be started and ready to accept connections.

The promise is rejected if the server could not be started for any reason, including if the database file is inaccessible or if the HTTP port is already occupied. In that case, the `CondictServer` is always stopped, regardless of whether it was already running or not.

#### `CondictHttpServer.prototype.stop()`

> `stop(): Promise<void>`

Stops the server. The underlying [Apollo server][apollo-server] is stopped first, followed by the [Condict server][condict-server]. The Condict server is stopped even if it was already running when the `CondictHttpServer` was constructed.

### `loadConfigFile()`

> `loadConfigFile(fileName: string): HttpServerConfig`

Loads a server configuration from a JSON file. This function reads the file synchronously, so will block until the file has been parsed and processed. The JSON file contents are described under [Configuration](#configuration).

If the config file is invalid, the function throws an error.

## CLI

The command-line interface for Condict exposes commands for starting a standalone server and managing users. When run without a command name, `condict-server` simply starts the server.

**Commands:**

* [`condict-server start`](#condict-server-start)
* [`condict-server add-user`](#condict-server-add-user)
* [`condict-server edit-user`](#condict-server-edit-user)
* [`condict-server log-out-user`](#condict-server-log-out-user)
* [`condict-server delete-user`](#condict-server-delete-user)

Running `condict-server` without a command name is equivalent to `condict-server start`.

**Global arguments:**

* `-c <file>` / `--config=<file>`: Specifies the file name of the [configuration file](#configuration).

This can be used with all commands. It can come before or after the command name.

### `condict-server start`

Starts the server. The server will stay running until it is terminated by Ctrl+C/SIGINT or SIGTERM.

```
condict-server start
```

### `condict-server add-user`

Adds a [user][condict-server-users] to the database. The program will prompt for omitted user details.

If there is already a user with the specified name, or if the password is invalid, the process exits with the code 1.

```
condict-server add-user [-p <password>] [[-n] <name>]
```

* `-n <name>` / `--name=<name>`: The name of the user to create. If omitted, the program will prompt for it.
* `-p <password>` / `--password=<password>`: The password of the new user. If omitted, the program will prompt for it.

### `condict-server edit-user`

Edits an existing [user][condict-server-users]. This command can rename a user and change their password, by name or ID. If the options specify at least one of `-n`/`--new-name` or `-p`/`--new-password`, then the other is _not_ prompted for. If both are omitted, the program prompts for both. Editing a user does _not_ invalidate existing sessions.

If there is a user with the new name, or if the new password is invalid, the process exits with the code 1.

```
condict-server edit-user [-n <new-name>] [-p <new-password>] (--id <id> | [-u] <name>)
```

* `-u <name>` / `--user=<name>`: The name of the user to edit. Cannot be combined with `--id`.
* `--id=<id>`: The ID of the user to edit. Cannot be combined with a username.
* `-n <new-name>` / `--new-name=<new-name>`: The name to rename the user to.
* `-p <new-password>` / `--new-password=<new-password>`: The new password to assign the user.

### `condict-server log-out-user`

Terminates every session associated with the specified user. This method is used to force the user to log out, for example in case credentials have been compromised.

_**Note:** This command is spelled `log-out-user`, not `logout-user`._

```
condict-server log-out-user (--id <id> | [-u] name)
```

* `-u <name>` / `--user=<name>`: The name of the user to log out. Cannot be combined with `--id`.
* `--id=<id>`: The ID of the user to log out. Cannot be combined with a username.

### `condict-server delete-user`

Deletes a [user][condict-server-users]. This command can delete a user by name or ID. If there is no user matching the supplied name or ID, the process exits with the code 2. If any other error occurs, the exit code is 1.

```
condict-server delete-user (--id <id> | [-u] <name>)
```

* `-u <name>` / `--user=<name>`: The name of the user to delete. Cannot be combined with `--id`.
* `--id=<id>`: The ID of the user to delete. Cannot be combined with a username.

## Configuration

Configuration files are JSON files with the following structure:

* `database`: An object:
  - `file`: The path to the SQLite file containing the dictionary database.
* `log`: An optional object:
  - `stdout`: The highest log level that will be written to stdout, or `false` to disable stdout logging. `true` is an alias for `'debug'` (everything written to stdout). If omitted, defaults to `false` in production and `'debug'` in development (based on the environment variable `NODE_ENV`).
  - `files`: An array of objects that specify log files to write to:
    + `path`: The path to the log file.
    + `level`: The highest log level that will be written to the file. If omitted or null, defaults to `'info'`.
* `http`: An optional object:
  - `port`: The port that the HTTP server will listen on. This must be a number between 1 and 65535, inclusive. If omitted or null, defaults to `4000`.

The recognised log levels, from lowest to highest, are:

* `'error'`
* `'warn'`
* `'info'`
* `'verbose'`
* `'debug'`

[condict-server]: ../server#condictserver-1
[condict-server-users]: ../server#users
[graphql]: https://graphql.org/
[apollo-server]: https://www.apollographql.com/docs/apollo-server/
