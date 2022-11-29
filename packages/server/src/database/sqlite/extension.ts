import path from 'path';

import {Database} from 'better-sqlite3';

// Our SQLite extension is not a Node module that is loaded with `require()`,
// but a standalone dynamic library. We can't use the `bindings` package to
// locate it. Instead, the build process places it in a well-known directory.
//
// When we're running inside the Electron app, the file is *outside* app.asar,
// as SQLite cannot load extensions that reside within ASAR archives.

const ExtensionName = 'condict.sqlite3-ext';

let apiPath: string;
if (__dirname.includes('app.asar')) {
  // FIXME: This is a bit hacky.
  // If the path to this file contains `app.asar`, we are (probably) running
  // inside the main Condict app. This regex strips the `/asar.app/` part
  // (`\` on Windows) and everything after it, and is likely quite fragile.
  apiPath = __dirname.replace(/[/\\]app.asar[/\\].*$/, `/${ExtensionName}`);
} else {
  apiPath = path.resolve(__dirname, `../bin/${ExtensionName}`);
}

const registerExtension = (db: Database): void => {
  db.loadExtension(apiPath);
};

export default registerExtension;
