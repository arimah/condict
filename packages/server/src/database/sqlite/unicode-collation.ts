import {Database} from 'better-sqlite3';
import bindings from 'bindings';

interface NativeBindings {
  /** The full path to the module, exposed by the bindings package. */
  readonly path: string;

  /**
   * Registers a collation to be added to the database when the extension is
   * loaded by SQLite.
   * @param name The collation name to register.
   * @param fn The collation function. See the CollatorFn type for details.
   */
  registerCollator(name: string, fn: CollatorFn): void;

  /**
   * Destroys the most recently registered collation function, if it has not
   * been consumed by the SQLite extension initializer.
   * @return True if there was a pending collator; false if it has been added
   *         to the database connection.
   */
  clearPendingCollator(): boolean;
}

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

const api = bindings('sqlite3_collation') as NativeBindings;

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
  api.registerCollator('unicode', getUnicodeCollator());

  db.loadExtension(api.path);

  if (api.clearPendingCollator()) {
    throw new Error('Unicode collation has not been defined in the database');
  }
};

export default registerUnicodeCollation;
