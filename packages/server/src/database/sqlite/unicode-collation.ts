import path from 'path';

import {Database} from 'better-sqlite3';

// Normally, native modules are located using the bindings package. Sadly, we
// can't make use of it here: when we're running inside the main Condict app,
// all the code will actually be contained in an ASAR archive. SQLite will
// then be unable to load the native code as an extension: it has no idea how
// to look inside an ASAR file, and nor does the OS.
//
// The app's build process copies the .node file to the same directory as
// app.asar - we can use this to locate the file. Otherwise, the file is in
// a known location relative to __dirname.

interface NativeBindings {
  /**
   * Registers a collation to be added to the database when the extension is
   * loaded by SQLite.
   * @param fn The collation function. See the CollatorFn type for details.
   */
  registerCollator(fn: CollatorFn): void;

  /**
   * Destroys the most recently registered collation function, if it has not
   * been consumed by the SQLite extension initializer.
   * @return True if there was a pending collator; false if it has been added
   *         to the database connection.
   */
  clearPendingCollator(): boolean;
}

const BindingsName = 'sqlite3_collation.node';

/**
 * A collator comparison function. The function MUST be infallible. If it
 * throws anything at all, the process will crash.
 * @param x The first string to compare.
 * @param y The second stirng to complare.
 * @return Negative if x is sorted before y; positive if x is sorted after y;
 *         zero if x is sorted the same as y. If the function returns anything
 *         other than a number, the process will crash.
 */
type CollatorFn = (x: string, y: string) => number;

let apiPath: string;
if (__dirname.includes('app.asar')) {
  // FIXME: This is a bit hacky.
  // If the path to this file contains `app.asar`, we are (probably) running
  // inside the main Condict app.
  apiPath = __dirname.replace(/[/\\]app.asar[/\\].*$/, `/${BindingsName}`);
} else {
  apiPath = path.resolve(__dirname, `../bin/${BindingsName}`);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const api = require(apiPath) as NativeBindings;

let unicodeCollator: Intl.Collator | null = null;

const getUnicodeCollator = (): CollatorFn => {
  // en uses the root collation order, which is approximately equally wrong
  // for all other languages and so suffices as a compromise that makes no
  // one particularly pleased.
  if (unicodeCollator === null) {
    unicodeCollator = new Intl.Collator('en', {
      numeric: true,
      caseFirst: 'lower',
    });
  }
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return unicodeCollator.compare;
};

const registerUnicodeCollation = (db: Database): void => {
  api.registerCollator(getUnicodeCollator());

  db.loadExtension(apiPath);

  if (api.clearPendingCollator()) {
    throw new Error('Unicode collation has not been defined in the database');
  }
};

export default registerUnicodeCollation;
