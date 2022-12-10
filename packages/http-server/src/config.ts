import fs from 'fs';

import {validateServerConfig, validateLoggerOptions} from '@condict/server';

import {HttpServerConfig, HttpOptions} from './types';

// This entire file is about taking unsafe `any` values and turning them into
// safe objects.
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const DefaultHttpPort = 4000;

const isObject = (value: any): value is { [key: string]: any } =>
  value != null && typeof value === 'object' && !Array.isArray(value);

export const validateHttpOptions = (config: any): HttpOptions => {
  if (config == null) {
    return {port: DefaultHttpPort};
  }
  if (!isObject(config)) {
    throw new Error('HTTP config must be an object, null or undefined.');
  }

  const port = config.port;
  if (port != null) {
    if (typeof port !== 'number' || !(1 <= port && port <= 65535)) {
      throw new Error(
        `Invalid HTTP port number: ${
          port
        } (expected a number between 1 and 65535)`
      );
    }
  }

  return {port: port ?? DefaultHttpPort};
};

/**
 * Validates an object with server, logger and HTTP configuration.
 * @param config The HTTP server configuration value.
 * @return The final HTTP server configuration.
 * @throws {Error} The config value is not an object, or contains an invalid
 *         configuration.
 */
export const validateHttpServerConfig = (
  config: any
): HttpServerConfig => {
  if (!isObject(config)) {
    throw new Error('Config must be an object.');
  }
  const serverConfig = validateServerConfig(config);
  const log = validateLoggerOptions(config.log);
  const http = validateHttpOptions(config.http);
  return {...serverConfig, log, http};
};

/**
 * Opens, parses and validates a JSON-based configuration file. Note: this
 * function is synchronous.
 * @param fileName The file name to read the configuration from.
 * @return The server and logger configuration.
 * @throws The file could not be opened, or the file contains an invalid
 *         configuration.
 */
const loadConfigFile = (fileName: string): HttpServerConfig => {
  const configText = fs.readFileSync(fileName, {
    encoding: 'utf-8',
  });
  const config = JSON.parse(configText);
  return validateHttpServerConfig(config);
};

export default loadConfigFile;
