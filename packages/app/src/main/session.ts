import fs from 'fs';

import {Logger} from '@condict/server';

import {SavedSession, SavedTab, SavedPreviousTab} from '../types';

import {SessionFile} from './paths';
import persistDebounced from './persist-debounced';
import ipc from './ipc';
import {isPlainObject} from './json-utils';

export interface Session {
  readonly current: SavedSession | null;
}

const initSession = (logger: Logger): Session => {
  let errors: string[] = [];
  let session = loadSession(SessionFile, errors);

  if (errors.length > 0) {
    logger.error(`Errors while restoring previous session:\n${
      errors.map(err => `- ${err}`).join('\n')
    }`);
    errors = [];
  }

  const saveSession = persistDebounced(logger, 'App/Session', () => {
    writeSession(SessionFile, session);
    logger.debug('App/Session: Saved');
  });

  ipc.handle('update-session', (_e, nextSession) => {
    session = nextSession;
    saveSession();
  });

  return {
    get current() {
      return session;
    },
  };
};

export default initSession;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

const loadSession = (
  fileName: string,
  errors: string[]
): SavedSession | null => {
  let sessionText: string;
  try {
    sessionText = fs.readFileSync(fileName, {encoding: 'utf-8'});
  } catch (e: any) {
    const code = e.code as string;
    if (code !== 'ENOENT') {
      errors.push(`Error reading session file: ${e.message}`);
    }
    return null;
  }

  let session: unknown;
  try {
    session = JSON.parse(sessionText);
  } catch (e: any) {
    errors.push(
      `Could not parse config file as JSON: ${e.message || String(e)}`
    );
    return null;
  }

  return validateSession(session, errors);
};

const validateSession = (
  value: unknown,
  errors: string[]
): SavedSession | null => {
  if (!isPlainObject(value)) {
    errors.push('Session is not an object');
    return null;
  }

  const tabs = validateTabList(value.tabs, errors);
  const currentTab = value.currentTab != null
    ? String(value.currentTab)
    : null;
  return {tabs, currentTab};
};

const validateTabList = (
  value: unknown,
  errors: string[]
): readonly SavedTab[] => {
  if (!Array.isArray(value)) {
    errors.push('tabs: Value is not an array');
    return [];
  }

  const tabs = [];
  let index = 0;
  for (const tabValue of value) {
    const tab = validateTab(tabValue, `tabs[${index}]`, errors);
    if (tab) {
      tabs.push(tab);
    }
    index++;
  }
  return tabs;
};

const validateTab = (
  value: unknown,
  path: string,
  errors: string[]
): SavedTab | null => {
  if (!isPlainObject(value)) {
    errors.push(`${path}: Value is not an object`);
    return null;
  }

  if (!isPlainObject(value.page)) {
    errors.push(`${path}.page: Value is not an object`);
    return null;
  }

  const id = String(value.id);
  const page = value.page;
  const title = String(value.title);
  const previous = value.previous
    ? validatePreviousTab(value.previous, `${path}.previous`, errors)
    : null;
  return {id, page, title, previous};
};

const validatePreviousTab = (
  value: unknown,
  path: string,
  errors: string[]
): SavedPreviousTab | null => {
  if (!isPlainObject(value)) {
    errors.push(`${path}: Value is not an object`);
    return null;
  }

  if (!isPlainObject(value.page)) {
    errors.push(`${path}.page: Value is not an object`);
    return null;
  }

  const page = value.page;
  const title = String(value.title);
  const previous = value.previous
    ? validatePreviousTab(value.previous, `${path}.previous`, errors)
    : null;
  return {page, title, previous};
};

/* eslint-enable @typescript-eslint/no-unsafe-member-access */
/* eslint-enable @typescript-eslint/restrict-template-expressions */

const writeSession = (
  fileName: string,
  session: SavedSession | null
): void => {
  if (!session) {
    session = {tabs: [], currentTab: null};
  }
  const sessionText = JSON.stringify(session, undefined, '  ');
  const options = {encoding: 'utf8'} as const;
  fs.writeFileSync(fileName, sessionText, options);
};
