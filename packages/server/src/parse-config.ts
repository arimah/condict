import fs from 'fs';

import {ServerConfig} from './server';

export default (fileName: string) => {
  const configText = fs.readFileSync(fileName, {
    encoding: 'utf-8',
  });
  return JSON.parse(configText) as ServerConfig;
};
