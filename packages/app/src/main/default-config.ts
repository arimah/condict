import path from 'path';

import {AppConfig} from '../types';

import {UserDataPath} from './paths';
import {DefaultLocale} from './translations';

const DefaultConfig: AppConfig = {
  appearance: {
    theme: 'system',
    accentColor: 'purple',
    dangerColor: 'red',
    sidebarColor: 'purple',
    zoomLevel: 100,
    motion: 'full',
  },
  locale: DefaultLocale,
  // Default to the least intrusive update policy. The user will be prompted
  // to select an update policy during initial setup.
  updates: 'manual',
  log: {
    stdout: false,
    files: [
      {
        level: 'error',
        path: path.join(UserDataPath, 'error.log'),
      },
    ],
  },
  server: {
    kind: 'local',
    database: {
      file: path.join(UserDataPath, 'dictionary.sqlite'),
    },
  },
  login: {
    username: null,
    sessionToken: null,
  },
};

export default DefaultConfig;
