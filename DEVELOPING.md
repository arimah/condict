# Developing Condict

Getting a development version of Condict up and running is a slightly involved process. Keep in mind **Condict is a work in progress, and many features are missing**, including documentation.

## Prerequisites

* [Node.js][nodejs] version 16 or higher with [npm][]
    - Yarn is _not_ recommended for this project
* A working C++ compiler for building native modules
    - [node-gyp][] is installed as a dependency where needed – see its documentation for setup instructions
    - On Windows, you must install Visual Studio Build Tools or a version of Visual Studio – version 2019 or later is strongly recommended

## Limitations

The [@condict/server](./packages/server) package relies on a few packages with native bindings, and contains a native package of its own. These must be rebuilt separately for Node and Electron. When running the server directly (or through [@condict/http-server](./packages/http-server)), you cannot start the app. When developing [the app](./packages/app), you cannot start the server directly.

You must remember to recompile native dependencies for the target you are developing. Native dependencies are _not_ recompiled automatically, because the process is a bit slow.

## Getting started

If you're using Git, first run this in the repo root: `git update-index --skip-worktree packages/*/dist/cli.js`

The matching files are provided so that subsequent commands work on Windows without any extra faff. They will be replaced when the respective packages are rebuilt, so we need to tell Git to ignore changes to them.

Run initial setup: `npm run setup`

This will install all dependencies, bootstrap packages with [Lerna][] and build everything. It may take a few minutes.

## Developing UI components

1. In the repo root, run `npm run dev:ui`
2. Open `http://localhost:3000` in a web browser for a component playground

Source files for the UI component playground are in [dev/](./dev).

**Note:** If another process is listening on port 3000, this command will fail. Close the process that is listening on port 3000.

## Developing the server

First time, or if you have just used the app, rebuild native dependencies:

1. `cd packages/server`
2. `npm run build:native`

To develop the server:

1. In the repo root, run `npm run dev:server`
2. In a different terminal:
    1. `cd packages/http-server`
    2. First time only: `cp config.json.example config.json`
    3. Please edit `config.json` file if you wish to customize logging and the database location.
    4. `npm start`

When the server is running, a GraphQL sandbox will be accessible at `http://localhost:4000`. If you have set a different port in the config, connect to that port instead of 4000.

**The server does _not_ automatically reload on recompilation.** You must restart it manually when you make changes. If you edit the native code in [src-cpp/](./packages/server/src-cpp), you must run `npm run build:native` to recompile the native bindings.

**Important:** The GraphQL sandbox is _not_ served locally. It's an embedded version of Apollo Sandbox. You must be connected to the internet to use it. If you do not wish to use it, you can query the server from any GraphQL client of your choice.

## Developing the app

1. `npm run dev:app`
2. In a different terminal:
    1. `cd packages/app`
    2. First time, or if you have just used the server: `npm run build:native`
    3. `npm start`

**The app does _not_ automatically reload on recompilation.** You must manually reload the server when you make changes (<kbd>Ctrl</kbd>+<kbd>R</kbd> or <kbd>⌘ Command</kbd>+<kbd>R</kbd>).

Now you should have a Condict window. Have fun!

## Having trouble?

If these instructions don't work, that's considered a documentation bug. Please consider filing an issue to get help!

[nodejs]: https://nodejs.org/
[npm]: https://npmjs.com
[node-gyp]: https://github.com/nodejs/node-gyp
[lerna]: https://lerna.js.org/
