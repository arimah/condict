import {BrowserWindow, shell} from 'electron';

const isExternalUrl = (url: string) => !url.startsWith('file://');

const withExternalLinksInBrowser = (win: BrowserWindow): void => {
  win.webContents.on('will-navigate', (e, url) => {
    if (isExternalUrl(url)) {
      e.preventDefault();
      void shell.openExternal(url);
    }
  });
};

export default withExternalLinksInBrowser;
