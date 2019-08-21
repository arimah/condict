import fs from 'fs';

import {ServerConfig, LoggerOptions, LogFile, isLogLevel} from './types';
import {validateOptions as validateDatabaseOptions} from './database';

const validateLogFile = (config: any): LogFile => {
  const path = config.path;
  if (typeof path !== 'string' || path === '') {
    throw new Error('Log file name must be a non-empty string.');
  }

  const level = config.level;
  if (level !== undefined && !isLogLevel(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return {path, level};
};

const validateLoggerOptions = (config: any): LoggerOptions => {
  if (config == null || typeof config !== 'object') {
    throw new Error('Logger config must be an object.');
  }

  let files = config.files;
  if (!Array.isArray(files)) {
    throw new Error("Logger config must have a 'files' property which must be an array.");
  }

  const validFiles = files.map(f => validateLogFile(f));

  return {files: validFiles};
};

const validateConfig = (config: any): ServerConfig => {
  const database = validateDatabaseOptions(config.database);
  const log = validateLoggerOptions(config.log);
  return {database, log};
};

export default (fileName: string) => {
  const configText = fs.readFileSync(fileName, {
    encoding: 'utf-8',
  });
  const config = JSON.parse(configText);
  return validateConfig(config);
};
