import fs from 'fs';
import path from 'path';

import {watch} from 'chokidar';

import {Logger} from '@condict/server';

import {getAppRootDir} from './paths';
import ipc from './ipc';

import {Locale} from '../types';

export interface Translations {
  /** The names of the currently available locales. */
  getAvailableLocales(): Promise<readonly Locale[]>;
  /**
   * A function that is called when a new locale is added.
   * @param locale The new locale.
   */
  onLocaleAdded: LocaleUpdatedCallback | null;
  /**
   * A function that is called when the source file of a locale is changed.
   * @param locale The locale that has changed.
   */
  onLocaleUpdated: LocaleUpdatedCallback | null;
  /**
   * A function that is called when a locale is deleted.
   * @param locale The name of the locale that was deleted.
   */
  onLocaleDeleted: LocaleDeletedCallback | null;
  /**
   * Loads the source text of the locale with the specified name.
   * @param locale The locale to load.
   * @return A promise that resolves with the source text of the specified
   *         locale. If the locale is unknown or the file could not be loaded,
   *         the promise is rejected.
   */
  loadBundle(locale: string): Promise<string>;
}

export type LocaleUpdatedCallback = (locale: Locale) => void;

export type LocaleDeletedCallback = (locale: string) => void;

export type AvailableLocalesChangedCallback = (
  locales: readonly Locale[]
) => void;

export const DefaultLocale = 'en';

const getLocaleName = (filePath: string): string => {
  const fileName = path.basename(filePath);
  return fileName.replace(/\.ftl$/, '');
};

const initTranslations = (logger: Logger): Translations => {
  const translationsDir = path.join(getAppRootDir(), 'locale');

  const availableLocaleNames =
    fs.readdirSync(translationsDir, {withFileTypes: true})
      .filter(f => f.isFile() && f.name.endsWith('.ftl'))
      .map(f => getLocaleName(f.name))
      .sort();

  const loadBundle = (locale: string): Promise<string> => {
    if (!availableLocaleNames.includes(locale)) {
      return Promise.reject(new Error(`Unknown locale: ${locale}`));
    }

    const fileName = path.join(translationsDir, `${locale}.ftl`);
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, {encoding: 'utf-8'}, (err, text) => {
        if (err) {
          reject(err);
        } else {
          resolve(text);
        }
      });
    });
  };

  let onLocaleAdded: LocaleUpdatedCallback | null = null;
  let onLocaleUpdated: LocaleUpdatedCallback | null = null;
  let onLocaleDeleted: LocaleDeletedCallback | null = null;

  // Chokidar globs must use / instead of \, so we need to normalize on Windows.
  const watcher = watch(`${translationsDir.replace(/\\/g, '/')}/*.ftl`, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
    },
  });
  watcher.on('add', file => {
    const locale = getLocaleName(file);
    if (!availableLocaleNames.includes(locale)) {
      availableLocaleNames.push(locale);
      availableLocaleNames.sort();
    }

    // The locale might have been loaded, then deleted, then readded. In this
    // case we emit it as a change to the locale rather than an addition.
    loadBundle(locale).then(
      source => {
        onLocaleAdded?.({name: locale, source});
      }, err => {
        logger.error(`Error loading locale '${locale}':`, err);
      }
    );
  });
  watcher.on('change', file => {
    const locale = getLocaleName(file);
    if (!availableLocaleNames.includes(locale)) {
      // Change event for a locale we haven't seen before? Ignore it.
      return;
    }

    loadBundle(locale).then(
      source => {
        onLocaleUpdated?.({name: locale, source});
      },
      err => {
        logger.error(`Error loading locale '${locale}':`, err);
      }
    );
  });
  watcher.on('unlink', file => {
    const locale = getLocaleName(file);
    if (!availableLocaleNames.includes(locale)) {
      // Unknown locale deleted. Ignore it.
      return;
    }

    const index = availableLocaleNames.indexOf(locale);
    availableLocaleNames.splice(index, 1);
    onLocaleDeleted?.(locale);
  });

  return {
    async getAvailableLocales(): Promise<readonly Locale[]> {
      return await Promise.all(availableLocaleNames.map(
        async (locale: string): Promise<Locale> => {
          const source = await loadBundle(locale);
          return {name: locale, source};
        }
      ));
    },

    loadBundle,

    get onLocaleAdded(): LocaleUpdatedCallback | null {
      return onLocaleAdded;
    },
    set onLocaleAdded(value: LocaleUpdatedCallback | null) {
      onLocaleAdded = value;
    },

    get onLocaleUpdated(): LocaleUpdatedCallback | null {
      return onLocaleUpdated;
    },
    set onLocaleUpdated(value: LocaleUpdatedCallback | null) {
      onLocaleUpdated = value;
    },

    get onLocaleDeleted(): LocaleDeletedCallback | null {
      return onLocaleDeleted;
    },
    set onLocaleDeleted(value: LocaleDeletedCallback |  null) {
      onLocaleDeleted = value;
    },
  };
};

export default initTranslations;
