import path from 'path';

import {AppConfig} from '../types';

import {UserDataPath} from './paths';

const DefaultConfig: AppConfig = {
  appearance: {
    theme: 'system',
    accentColor: 'purple',
    dangerColor: 'red',
    sidebarColor: 'purple',
    zoomLevel: 100,
    motion: 'full',
  },
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
