import url from 'url';
import path from 'path';

import {app} from 'electron';

/** An absolute path that points to the user data directory. */
export const UserDataPath =
  process.env.CONDICT_DATA_DIR
    ? process.env.CONDICT_DATA_DIR
    : app.getPath('userData');

/** The absolute path to the current config file. */
export const ConfigFile = path.join(UserDataPath, 'config.json');

/**
 * The absolute path to the file that stores the current session (open tabs).
 */
export const SessionFile = path.join(UserDataPath, 'session.json');

/**
 * The absolute path to the file that stores the window state (the position
 * and size of the main window).
 */
export const WindowStateFile = path.join(UserDataPath, 'window.json');

export const getAppRootDir = (): string =>
  path.dirname(
    path.dirname(
      url.fileURLToPath(import.meta.url)
    )
  );
