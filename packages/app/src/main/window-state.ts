import fs from 'fs';

import {BrowserWindow} from 'electron';

import debounce from './debounce';

type WindowState = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  maximized: boolean;
};

export const MinWidth = 875;
export const MinHeight = 540;
export const InitialWidth = 900;
export const InitialHeight = 650;

const DefaultWindowState: WindowState = {
  width: MinWidth,
  height: 650,
  maximized: false,
};

export const withPersistentWindowState = (
  win: BrowserWindow,
  fileName: string
): void => {
  let lastWindowState = loadWindowState(fileName);

  // Move the window to where we last saw it
  win.setBounds(lastWindowState, false);

  const getCurrentWindowState = (): WindowState => {
    // Don't save the window's maximied size and position; otherwise we won't
    // be able to restore the unmaximized size.
    const bounds = !win.isMaximized() ? win.getBounds() : null;
    return {
      ...lastWindowState,
      ...bounds,
      maximized: win.isMaximized(),
    };
  };

  const writeWindowState = () => {
    const newState = getCurrentWindowState();
    lastWindowState = newState;
    void saveWindowState(fileName, newState);
  };

  const updateWindowState = debounce(1000, writeWindowState);

  win.on('move', updateWindowState);
  win.on('resize', updateWindowState);

  // When the window is about to close, save the window state immediately.
  win.on('close', writeWindowState);

  win.on('ready-to-show', () => {
    if (lastWindowState.maximized) {
      win.maximize();
    }
  });
};

const loadWindowState = (fileName: string): WindowState => {
  // If the file doesn't exist or can't be read, don't log an error; just
  // use the default window state.
  let windowStateText: string;
  try {
    windowStateText = fs.readFileSync(fileName, {
      encoding: 'utf-8',
    });
  } catch (e) {
    return DefaultWindowState;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const windowState = JSON.parse(windowStateText);
    return validateWindowState(windowState);
  } catch (e) {
    console.error('Error restoring window state, reverting to default:', e);
    return DefaultWindowState;
  }
};

const validateWindowState = (value: any): WindowState => {
  const state: WindowState = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    width: validateInteger(value.width, DefaultWindowState.width),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    height: validateInteger(value.height, DefaultWindowState.height),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    maximized: !!value.maximized,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const x = validateInteger(value.x, undefined);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const y = validateInteger(value.y, undefined);

  // If either coordinate is set, both must be.
  if (x !== undefined && y !== undefined) {
    state.x = x;
    state.y = y;
  }

  return state;
};

const validateInteger = <D extends number | undefined | null>(
  value: any,
  fallback: D
): number | D => {
  const n = typeof value === 'number'
    ? value | 0
    : parseInt(String(value), 10) | 0;
  if (isNaN(n) || !isFinite(n)) {
    return fallback;
  }
  return n;
};

const saveWindowState = (
  fileName: string,
  windowState: WindowState
): Promise<void> => {
  const windowStateText = JSON.stringify(windowState, undefined, '  ');
  const options = {encoding: 'utf8'};
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(fileName, windowStateText, options, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
