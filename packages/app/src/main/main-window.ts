import path from 'path';

import {BrowserWindow, app} from 'electron';

import {AppConfig} from '../types';

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
}

const initMainWindow = (getConfig: () => AppConfig): MainWindowInstance => {
  let onReady: (() => Promise<void>) | null = null;
  let win: BrowserWindow | null = null;

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
      win?.webContents.send('context-menu', params);
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

  ipc.handle('window-ready', e => {
    if (e.sender === win?.webContents && onReady) {
      return onReady();
    }
    return Promise.resolve();
  });

  return {
    get onReady(): ReadyCallback | null {
      return onReady;
    },
    set onReady(value: ReadyCallback | null) {
      onReady = value;
    },
  };
};

export default initMainWindow;
