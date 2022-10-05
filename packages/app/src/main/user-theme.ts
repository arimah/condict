import fs from 'fs';

import {watch} from 'chokidar';

import {Logger} from '@condict/server';
import type {ThemeVariables} from '@condict/ui';

import {UserTheme, ThemeName} from '../types';

import {isPlainObject} from './json-utils';
import ipc from './ipc';

export interface UserThemeInstance {
  /** A function that is called when the user theme file is changed. */
  onUpdated: UpdatedCallback | null;
  /**
   * Loads the current user theme file. Errors are written to the current
   * logger.
   * @return The loaded user theme, or null if there is no theme or an error
   *         occurred when loading it.
   */
  load(): Promise<UserTheme | null>;
  /**
   * Updates the file that the user theme is loaded from.
   * @param fileName The new file name to read the user theme from, or null to
   *        disable user theming.
   */
  setFile(fileName: string | null): void;
}

export type UpdatedCallback = () => void;

type MutableThemeVariables = {
  [K in keyof ThemeVariables]: ThemeVariables[K];
};

const initUserTheme = (
  logger: Logger,
  fileName: string | null
): UserThemeInstance => {
  let theme: UserTheme | null = null;

  const load = async (): Promise<UserTheme | null> => {
    if (fileName === null) {
      return null;
    }

    if (theme) {
      return theme;
    }

    try {
      theme = await loadUserTheme(fileName);
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      logger.error(`Could not load user theme: ${e.message || String(e)}`);
    }
    return theme;
  };

  let onUpdated: UpdatedCallback | null = null;

  const watcher = watch([], {
    ignoreInitial: true,
    disableGlobbing: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
    },
  });
  watcher.on('all', () => {
    // No matter what's happened to the file, invalidate the theme and raise
    // the change event.
    theme = null;
    onUpdated?.();
  });

  if (fileName !== null) {
    // chokidar does not like backslashes, even on Windows
    fileName = fileName.replace(/\\/g, '/');
    watcher.add(fileName);
  }

  ipc.handle('get-user-theme', () => load());

  return {
    load,

    setFile(newFileName: string) {
      if (newFileName === fileName) {
        return;
      }

      if (fileName !== null) {
        watcher.unwatch(fileName);
      }
      if (newFileName !== null) {
        // chokidar does not like backslashes, even on Windows
        newFileName = newFileName.replace(/\\/g, '/');
        watcher.add(newFileName);
      }
      fileName = newFileName;
      theme = null;
      onUpdated?.();
    },

    get onUpdated(): UpdatedCallback | null {
      return onUpdated;
    },
    set onUpdated(value: UpdatedCallback | null) {
      onUpdated = value;
    },
  };
};

export default initUserTheme;

const loadUserTheme = (fileName: string): Promise<UserTheme> => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, {encoding: 'utf-8'}, (err, text) => {
      if (err) {
        reject(new Error(`Could not read user theme file: ${String(err)}`));
        return;
      }

      let theme: unknown;
      try {
        theme = JSON.parse(text);
      } catch (e: any) {
        reject(
          new Error(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `Could not parse user theme file as JSON: ${e.message || String(e)}`
          )
        );
        return;
      }

      resolve(validateUserTheme(theme));
    });
  });
};

const validateUserTheme = (value: unknown): UserTheme => {
  if (!isPlainObject(value)) {
    throw new Error('User theme is not an object');
  }

  const name = String(value.name);
  const author = value.author != null ? String(value.author) : null;
  const extends_ = validateExtends(value.extends);
  const vars = validateThemeVars(value.vars);

  return {
    name,
    author,
    extends: extends_,
    vars,
  };
};

const validateExtends = (value: unknown): ThemeName => {
  switch (value) {
    case 'light':
    case 'dark':
      return value;
    case undefined:
    case null:
      return 'light';
    default:
      throw new Error(`extends: invalid value: ${String(value)}`);
  }
};

const validateThemeVars = (value: unknown): ThemeVariables => {
  if (!isPlainObject(value)) {
    throw new Error('vars: Value is not an object');
  }

  const vars: MutableThemeVariables = {};
  for (const [k, v] of Object.entries(value)) {
    vars[k] = v == null ? null : String(v);
  }
  return vars;
};
