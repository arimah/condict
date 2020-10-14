import fs from 'fs';

import {
  ServerConfig,
  ServerConfigWithLogger,
  LoggerOptions,
  LogFile,
  LogLevel,
  isLogLevel,
} from './types';
import {validateOptions as validateDatabaseOptions} from './database';

// This entire file is about taking unsafe `any` values and turning them into
// safe objects.
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const isObject = (value: any): value is { [key: string]: any } =>
  value != null && typeof value === 'object' && !Array.isArray(value);

const validateStdout = (value: any): LogLevel | false => {
  switch (value) {
    case null:
    case undefined:
      // If stdout logging is not specified, default to showing everything in
      // development and nothing in production.
      return process.env.NODE_ENV === 'development' ? 'debug' : false;
    case true:
      return 'debug';
    case false:
      return false;
    default:
      if (!isLogLevel(value)) {
        throw new Error(`Invalid log level: ${value}`);
      }
      return value;
  }
};

const validateLogFile = (config: any): LogFile => {
  if (!isObject(config)) {
    throw new Error('Log file config must be an object.');
  }

  const path = config.path;
  if (typeof path !== 'string' || path === '') {
    throw new Error('Log file name must be a non-empty string.');
  }

  const level = config.level;
  if (level != null && !isLogLevel(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return {path, level: level || 'info'};
};

/**
 * Validates an object with logger options.
 * @param config The configuration value.
 * @return The final logger configuration.
 * @throws {Error} The config value is not an object, or contains an invalid
 *         configuration.
 */
export const validateLoggerOptions = (config: any): LoggerOptions => {
  if (config == null) {
    return {stdout: false, files: []};
  }
  if (!isObject(config)) {
    throw new Error('Logger config must be an object, null or undefined.');
  }

  const stdout = validateStdout(config.stdout);

  const files = config.files;
  if (!Array.isArray(files)) {
    throw new Error("Logger config must have a 'files' property which must be an array.");
  }

  const validFiles = files.map(f => validateLogFile(f));

  return {stdout, files: validFiles};
};

/**
 * Validates an object with server configuration.
 * @param config The configuration value.
 * @return The final server configuration.
 * @throws {Error} The config value is not an object, or contains an invalid
 *         configuration.
 */
export const validateConfig = (config: any): ServerConfig => {
  if (!isObject(config)) {
    throw new Error('Config must be an object.');
  }
  const database = validateDatabaseOptions(config.database);
  return {database};
};

/**
 * Validates an object with server and logger configuration.
 * @param config The server and logger configuration value.
 * @return The final server and logger configuration.
 * @throws {Error} The config value is not an object, or contains an invalid
 *         configuration.
 */
export const validateConfigWithLogger = (
  config: any
): ServerConfigWithLogger => {
  if (!isObject(config)) {
    throw new Error('Config must be an object.');
  }
  const basicConfig = validateConfig(config);
  const log = validateLoggerOptions(config.log);
  return {...basicConfig, log};
};

/**
 * Opens, parses and validates a JSON-based configuration file. Note: this
 * function is synchronous.
 * @param fileName The file name to read the configuration from.
 * @return The server and logger configuration.
 * @throws The file could not be opened, or the file contains an invalid
 *         configuration.
 */
const loadConfigFile = (fileName: string): ServerConfigWithLogger => {
  const configText = fs.readFileSync(fileName, {
    encoding: 'utf-8',
  });
  const config = JSON.parse(configText);
  return validateConfigWithLogger(config);
};

export default loadConfigFile;
