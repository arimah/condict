import chalk, {Chalk} from 'chalk';
import * as winston from 'winston';
import * as Transport from 'winston-transport';

import {Logger, LoggerOptions, LogLevel} from './types';

const levels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const levelColors: Record<LogLevel, Chalk> = {
  error: chalk.redBright,
  warn: chalk.yellowBright,
  info: chalk.cyanBright,
  debug: chalk.greenBright,
};

const consoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(
    info => {
      const timestamp = chalk.gray(`[${info.timestamp}]`);
      const level = levelColors[info.level as LogLevel](`[${info.level}]`);
      return `${timestamp} ${level} ${info.message}`;
    }
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const NullLogger: Logger = {
  error() { },
  warn() { },
  info() { },
  debug() { },
};

export default (config: LoggerOptions): Logger => {
  const transports: Transport[] = [];

  if (config.stdout) {
    transports.push(new winston.transports.Console({
      level: config.stdout,
      format: consoleFormat,
    }));
  }

  config.files.forEach(file => {
    transports.push(new winston.transports.File({
      filename: file.path,
      level: file.level,
      format: fileFormat,
    }));
  });

  if (transports.length === 0) {
    return NullLogger;
  }

  return winston.createLogger({levels, transports});
};
