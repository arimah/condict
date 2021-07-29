import {BrowserWindow, app, dialog, nativeTheme} from 'electron';

import {createLogger} from '@condict/server';
import {isMacOS} from '@condict/platform';

import initConfig from './config';
import initServer from './server';
import initTranslations, {DefaultLocale} from './translations';
import initUpdater from './updater';
import initMainWindow from './main-window';
import ipc from './ipc';

const main = (): void => {
  const translations = initTranslations();

  const config = initConfig(translations.availableLocales);

  const logger = createLogger(config.current.log);

  const configErrors = config.takeErrors();
  if (configErrors.length > 0) {
    logger.error(`Errors while loading app config:\n${
      configErrors.map(err => `- ${err}`).join('\n')
    }`);
  }

  const server = initServer(
    logger,
    config.current.server,
    () => config.current.login.sessionToken
  );

  const updater = initUpdater();

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

  translations.onLocaleUpdated = locale => {
    mainWindow.send('locale-updated', locale);
  };

  translations.onAvailableLocalesChanged = locales => {
    mainWindow.send('available-locales-changed', locales);
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

    const defaultBundle = await translations.loadBundle(DefaultLocale);
    const currentBundle = await translations.loadBundle(cfg.locale);

    return {
      config: cfg,
      systemTheme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
      availableLocales: translations.availableLocales,
      defaultLocale: {
        locale: DefaultLocale,
        source: defaultBundle,
      },
      currentLocale: {
        locale: cfg.locale,
        source: currentBundle,
      },
    };
  });
};

export default main;
