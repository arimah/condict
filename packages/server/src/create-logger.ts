import chalk, {Chalk} from 'chalk';
import * as winston from 'winston';
import Transport from 'winston-transport';

import {Logger, LoggerOptions, LogLevel} from './types';

const levels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};

const levelColors: Record<LogLevel, Chalk> = {
  error: chalk.redBright,
  warn: chalk.yellowBright,
  info: chalk.cyanBright,
  verbose: chalk.greenBright,
  debug: chalk.magenta,
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

/**
 * Creates a logger from the specified options.
 * @param config Specifies logging options for stdout and files.
 * @return A logger.
 */
const createLogger = (config: LoggerOptions): Logger => {
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
    return createNullLogger();
  }

  return winston.createLogger({levels, transports});
};

export default createLogger;

/**
 * Creates a logger that discards all incoming messages.
 * @return A logger that does nothing.
 */
export const createNullLogger = (): Logger => ({
  error() { /* no-op */ },
  warn() { /* no-op */ },
  info() { /* no-op */ },
  verbose() { /* no-op */ },
  debug() { /* no-op */ },
});

/**
 * Creates a logger that prepends a prefix to all incoming messages.
 * @param inner The logger to wrap.
 * @param prefix The prefix to add to each message.
 * @return A prefixing logger.
 */
export const createPrefixLogger = (inner: Logger, prefix: string): Logger => ({
  error(msg, ...extra) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    inner.error(`${prefix} ${msg}`, ...extra);
  },
  warn(msg, ...extra) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    inner.warn(`${prefix} ${msg}`, ...extra);
  },
  info(msg, ...extra) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    inner.info(`${prefix} ${msg}`, ...extra);
  },
  verbose(msg, ...extra) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    inner.verbose(`${prefix} ${msg}`, ...extra);
  },
  debug(msg, ...extra) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    inner.debug(`${prefix} ${msg}`, ...extra);
  },
});
