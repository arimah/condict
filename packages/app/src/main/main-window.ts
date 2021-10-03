import path from 'path';

import {BrowserWindow, app, nativeTheme} from 'electron';

import {MainChannels} from '../ipc-channels';
import {AppConfig, IpcMessageArg} from '../types';

import ipc from './ipc';
import {WindowStateFile} from './paths';
import {
  InitialWidth,
  InitialHeight,
  MinWidth,
  MinHeight,
  withPersistentWindowState,
} from './window-state';
import withExternalLinksInBrowser from './link-opener';

export type ReadyCallback = () => Promise<void>;

export interface MainWindowInstance {
  onReady: ReadyCallback | null;
  /**
   * Sends an IPC message to the window, if the window is currently open.
   * @param channel The channel (message name).
   * @param args Arguments to pass along with the message.
   */
  readonly send: SendIpcFn;
}

export type SendIpcFn = <C extends keyof MainChannels>(
  channel: C,
  ...args: IpcMessageArg<MainChannels[C]>
) => void;

const initMainWindow = (getConfig: () => AppConfig): MainWindowInstance => {
  let onReady: (() => Promise<void>) | null = null;
  let win: BrowserWindow | null = null;

  const send: SendIpcFn = (channel, ...args) => {
    win?.webContents.send(channel, ...args);
  };

  const createWindow = () => {
    if (win) {
      return;
    }

    const config = getConfig();

    win = new BrowserWindow({
      title: 'Condict',
      width: InitialWidth,
      height: InitialHeight,
      minWidth: MinWidth,
      minHeight: MinHeight,
      show: false,
      frame: true,
      autoHideMenuBar: true,
      backgroundColor:
        config.appearance.theme === 'dark'
          ? '#000000'
          : '#ffffff',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        zoomFactor: config.appearance.zoomLevel / 100,
        spellcheck: false,
      },
    });

    withPersistentWindowState(win, WindowStateFile);
    withExternalLinksInBrowser(win);

    win.on('closed', () => {
      win = null;
      onReady = null;
    });

    win.on('ready-to-show', () => {
      win?.show();
    });

    win.webContents.on('context-menu', (_e, params) => {
      send('context-menu', params);
    });

    void win.loadFile(path.join(__dirname, '../static/index.html'));
  };

  app.on('ready', createWindow);
  app.on('activate', createWindow);

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      }
      win.focus();
    }
  });

  nativeTheme.on('updated', () => {
    send(
      'system-theme-change',
      nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    );
  });

  ipc.handle('window-ready', e => {
    if (e.sender === win?.webContents && onReady) {
      return onReady();
    }
    return Promise.resolve();
  });

  return {
    send,

    get onReady(): ReadyCallback | null {
      return onReady;
    },
    set onReady(value: ReadyCallback | null) {
      onReady = value;
    },
  };
};

export default initMainWindow;
