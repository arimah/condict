import {ConfigOptions as DatabaseConfigOptions} from './database/types';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export type LogFile = {
  path: string;
  level?: LogLevel;
};

export type LoggerOptions = {
  stdout: LogLevel | false;
  files: LogFile[];
};

export type ServerConfig = {
  database: DatabaseConfigOptions;
  log: LoggerOptions;
};

export type Logger = {
  [K in LogLevel]: (message: string, ...extra: any[]) => void;
};

export const isLogLevel = (value: any): value is LogLevel =>
  value === 'error' ||
  value === 'warn' ||
  value === 'info' ||
  value === 'debug';
