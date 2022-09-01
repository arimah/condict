import fs from 'fs';

import {nativeTheme} from 'electron';

import {
  Logger,
  LoggerOptions,
  validateConfig as validateLocalServerConfig,
  validateLoggerOptions,
  createLogger,
} from '@condict/server';
import type {MotionPreference} from '@condict/ui';

import {
  AppConfig,
  AppearanceConfig,
  ThemePreference,
  ColorName,
  UpdatePolicy,
  ServerConfig,
  LoginConfig,
} from '../types';

import DefaultConfig from './default-config';
import {ConfigFile} from './paths';
import persistDebounced from './persist-debounced';
import {PlainObject, isPlainObject} from './json-utils';
import ipc from './ipc';

export interface ConfigInstance {
  readonly current: AppConfig;
  readonly logger: Logger;
}

const initConfig = (availableLocales: readonly string[]): ConfigInstance => {
  let errors: string[] = [];
  let config: AppConfig = loadConfig(ConfigFile, availableLocales, errors);

  const logger = createLogger(config.log);
  if (errors.length > 0) {
    logger.error(`Errors while loading app config:\n${
      errors.map(err => `- ${err}`).join('\n')
    }`);
    errors = [];
  }

  nativeTheme.themeSource = config.appearance.theme;

  const saveConfig = persistDebounced(logger, 'App/Config', () => {
    writeConfig(ConfigFile, config);
    logger.debug('App/Config: Saved');
  });

  ipc.handle('get-config', () => config);

  ipc.handle('get-config-path', () => ConfigFile);

  ipc.handle('set-config', (_e, newConfig) => {
    config = newConfig;
    if (nativeTheme.themeSource !== newConfig.appearance.theme) {
      nativeTheme.themeSource = newConfig.appearance.theme;
    }
    saveConfig();
  });

  return {
    get current(): AppConfig {
      return config;
    },
    logger,
  };
};

export default initConfig;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

const loadConfig = (
  fileName: string,
  availableLocales: readonly string[],
  errors: string[]
): AppConfig => {
  let configText: string;
  try {
    configText = fs.readFileSync(fileName, {encoding: 'utf-8'});
  } catch (e: any) {
    const code = e.code as string;
    if (code !== 'ENOENT') {
      errors.push(`Error reading config file: ${e.message}`);
    }
    return DefaultConfig;
  }

  let config: unknown;
  try {
    config = JSON.parse(configText);
  } catch (e: any) {
    errors.push(
      `Could not parse config file as JSON: ${e.message || String(e)}`
    );
    return DefaultConfig;
  }

  return validateConfig(config, availableLocales, errors);
};

const validateConfig = (
  value: unknown,
  availableLocales: readonly string[],
  errors: string[]
): AppConfig => {
  if (!isPlainObject(value)) {
    errors.push('Config is not an object');
    return DefaultConfig;
  }

  const appearance = validateAppearanceConfig(value.appearance, errors);
  const locale = validateLocale(value.locale, availableLocales, errors);
  const updates = validateUpdatePolicy(value.updates, errors);
  const log = validateLoggerConfig(value.log, errors);
  const server = validateServerConfig(value.server, errors);
  const login = validateLoginConfig(value.login, errors);
  return {appearance, locale, updates, log, server, login};
};

const validateAppearanceConfig = (
  value: unknown,
  errors: string[]
): AppearanceConfig => {
  if (!isPlainObject(value)) {
    errors.push('appearance: Config is not an object');
    return DefaultConfig.appearance;
  }

  const theme = validateTheme(value.theme, errors);
  const accentColor = validateColor(value.accentColor, 'accentColor', errors);
  const dangerColor = validateColor(value.dangerColor, 'dangerColor', errors);
  const sidebarColor = validateColor(value.sidebarColor, 'sidebarColor', errors);
  const zoomLevel = validateZoomLevel(value.zoomLevel, errors);
  const motion = validateMotionPreference(value.motion, errors);

  return {
    theme,
    accentColor,
    dangerColor,
    sidebarColor,
    zoomLevel,
    motion,
  };
};

const validateLocale = (
  value: unknown,
  availableLocales: readonly string[],
  errors: string[]
): string => {
  if (typeof value !== 'string') {
    errors.push(`locale: Config is not a string: ${value}`);
    return DefaultConfig.locale;
  }
  if (!availableLocales.includes(value)) {
    errors.push(`locale: invalid value: ${value}`);
    return DefaultConfig.locale;
  }
  return value;
};

const validateTheme = (value: unknown, errors: string[]): ThemePreference => {
  switch (value) {
    case 'light':
    case 'dark':
    case 'system':
      return value;
    default:
      errors.push(`appearance.theme: invalid value: ${value}`);
      return DefaultConfig.appearance.theme;
  }
};

const validateColor = (
  value: unknown,
  key: 'accentColor' | 'dangerColor' | 'sidebarColor',
  errors: string[]
): ColorName => {
  switch (value) {
    case 'red':
    case 'orange':
    case 'yellow':
    case 'green':
    case 'teal':
    case 'blue':
    case 'purple':
    case 'gray':
      return value;
    default:
      errors.push(`appearance.${key}: invalid value: ${value}`);
      return DefaultConfig.appearance[key];
  }
};

const validateZoomLevel = (value: unknown, errors: string[]): number => {
  if (
    typeof value !== 'number' ||
    value < 50 ||
    value > 200
  ) {
    errors.push(`appearance.zoomLevel: invalid value: ${value}`);
    return DefaultConfig.appearance.zoomLevel;
  }
  return value;
};

const validateMotionPreference = (
  value: unknown,
  errors: string[]
): MotionPreference => {
  switch (value) {
    case 'full':
    case 'reduced':
    case 'none':
      return value;
    default:
      errors.push(`appearance.motion: invalid value: ${value}`);
      return DefaultConfig.appearance.motion;
  }
};

const validateUpdatePolicy = (
  value: unknown,
  errors: string[]
): UpdatePolicy => {
  switch (value) {
    case 'download':
    case 'check':
    case 'manual':
      return value;
    default:
      errors.push(`updates: invalid value: ${value}`);
      return DefaultConfig.updates;
  }
};

const validateLoggerConfig = (
  value: unknown,
  errors: string[]
): LoggerOptions => {
  try {
    return validateLoggerOptions(value);
  } catch (e: any) {
    errors.push(`log: Error validating config: ${e.message || String(e)}`);
    return DefaultConfig.log;
  }
};

const validateServerConfig = (
  value: unknown,
  errors: string[]
): ServerConfig => {
  if (!isPlainObject(value)) {
    errors.push('server: Config is not an object');
    return DefaultConfig.server;
  }

  switch (value.kind) {
    case 'local':
      try {
        const config = validateLocalServerConfig(value);
        return {kind: 'local', ...config};
      } catch (e: any) {
        errors.push(
          `server: Error validating local config: ${e.message || String(e)}`
        );
        return DefaultConfig.server;
      }
    case 'remote':
      return validateRemoteServerConfig(value, errors);
    default:
      errors.push(`server.kind: invalid value: ${value.kind}`);
      return DefaultConfig.server;
  }
};

const validateRemoteServerConfig = (
  value: PlainObject,
  errors: string[]
): ServerConfig => {
  const {url} = value;

  if (typeof url !== 'string') {
    errors.push(`server.url: invalid value (expected string): ${url}`);
    return DefaultConfig.server;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    errors.push(`server.url: invalid URL: ${url}`);
    return DefaultConfig.server;
  }

  if (/^https?:$/.test(parsedUrl.protocol)) {
    errors.push(
      `server.url: invalid or illegal protocol: ${parsedUrl.protocol}`
    );
    return DefaultConfig.server;
  }

  return {kind: 'remote', url};
};

const validateLoginConfig = (value: unknown, errors: string[]): LoginConfig => {
  if (!isPlainObject(value)) {
    errors.push('login: Config is not an object');
    return DefaultConfig.login;
  }

  const username = value.username ? String(value.username) : null;
  const sessionToken = value.sessionToken ? String(value.sessionToken) : null;

  return {username, sessionToken};
};

/* eslint-enable @typescript-eslint/no-unsafe-member-access */
/* eslint-enable @typescript-eslint/restrict-template-expressions */

const writeConfig = (fileName: string, config: AppConfig): void => {
  const configText = JSON.stringify(config, undefined, '  ');
  const options = {encoding: 'utf8'} as const;
  fs.writeFileSync(fileName, configText, options);
};
