import {Options as DatabaseConfigOptions} from './database';

/** Contains Condict server configuration. */
export interface ServerConfig {
  /** Database configuration. */
  readonly database: DatabaseConfigOptions;
}

/** Represents a log level. */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/** Contains configuration for a single log file. */
export interface LogFile {
  /**
   * The path to write the log to. The file will be created if it does not
   * exist.
   */
  readonly path: string;
  /**
   * Determines the highest priority message level that will be written to
   * the file.
   */
  readonly level?: LogLevel;
}

/** Contains configuration for the logger. */
export interface LoggerOptions {
  /**
   * Determines the highest priority message level that will be written to
   * the standard output. If set to `false`, standard output logging is
   * disabled.
   */
  readonly stdout: LogLevel | false;
  /** Contains configuration for log files that will be written to. */
  readonly files: LogFile[];
}

/** Combines server configuration and log configuration in one type. */
export type ServerConfigWithLogger = ServerConfig & {
  /** Logger configuration. */
  readonly log: LoggerOptions;
};

/**
 * Represents a highly generic logger type, which is compatible with loggers
 * from the Winston library.
 */
export type Logger = {
  /**
   * Sends a log message of the specified level.
   * @param message The log message.
   * @param extra Additional details to include with the message.
   */
  readonly [K in LogLevel]: (message: string, ...extra: any[]) => void;
};

/**
 * Determines whether a value is a valid log level.
 * @param value The value to check.
 * @return True if the value is a LogLevel.
 */
export const isLogLevel = (value: any): value is LogLevel =>
  value === 'error' ||
  value === 'warn' ||
  value === 'info' ||
  value === 'debug';
