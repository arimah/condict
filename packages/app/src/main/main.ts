import {BrowserWindow, app, dialog, nativeTheme} from 'electron';

import {isMacOS} from '@condict/platform';

import initConfig from './config';
import initServer from './server';
import initTranslations, {DefaultLocale} from './translations';
import initUpdater from './updater';
import initSession from './session';
import initMainWindow from './main-window';
import ipc from './ipc';

const main = (): void => {
  const config = initConfig();
  const {logger} = config;

  const translations = initTranslations(logger);

  const server = initServer(
    logger,
    config.current.server,
    () => config.current.login.sessionToken
  );

  const updater = initUpdater();

  const session = initSession(logger);

  const mainWindow = initMainWindow(() => config.current);

  mainWindow.onReady = () => {
    if (server.ready) {
      // Server is already ready, can resolve immediately.
      return Promise.resolve();
    }

    // We need to wait for the server to become ready.
    return new Promise(resolve => {
      server.onReady = resolve;
    });
  };

  if (!isMacOS) {
    app.on('window-all-closed', () => {
      app.quit();
    });
  }

  server.onEventBatch = batch => {
    mainWindow.send('dictionary-event-batch', batch);
  };

  config.onUserThemeUpdated = () => {
    mainWindow.send('user-theme-change');
  };

  translations.onLocaleAdded = locale => {
    mainWindow.send('locale-added', locale);
  };

  translations.onLocaleUpdated = locale => {
    mainWindow.send('locale-updated', locale);
  };

  translations.onLocaleDeleted = localeName => {
    mainWindow.send('locale-deleted', localeName);
  };

  updater.onStatusChanged = status => {
    mainWindow.send('update-status-changed', status);
  };

  updater.onDownloadProgress = progress => {
    mainWindow.send('update-download-progress', progress);
  };

  ipc.handle('show-open-dialog', (e, options) => {
    const browserWindow = BrowserWindow.fromWebContents(e.sender);
    if (!browserWindow) {
      throw new Error('Could not acquire BrowserWindow from WebContents');
    }
    return dialog.showOpenDialog(browserWindow, options);
  });

  ipc.handle('execute-edit-command', (e, cmd) => {
    e.sender[cmd]();
  });

  ipc.handle('get-initial-state', async () => {
    const cfg = config.current;

    const availableLocales = await translations.getAvailableLocales();
    const currentUserTheme = await config.loadUserTheme();

    return {
      config: cfg,
      systemTheme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
      availableLocales,
      defaultLocale: DefaultLocale,
      currentLocale: cfg.locale,
      lastSession: session.current,
      userTheme: currentUserTheme,
    };
  });
};

export default main;
