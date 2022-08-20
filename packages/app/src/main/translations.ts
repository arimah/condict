import fs from 'fs';
import path from 'path';

import {watch} from 'chokidar';

import ipc from './ipc';

export interface Translations {
  /** The currently available locales. */
  readonly availableLocales: readonly string[];
  /**
   * A function that is called when the source file of a locale is changed.
   * @param locale The name of the locale that has changed.
   */
  onLocaleUpdated: LocaleUpdatedCallback | null;
  /**
   * A function that is called when the set of available locales has changed.
   * @param locales Array of all locales that are now available.
   */
  onAvailableLocalesChanged: AvailableLocalesChangedCallback | null;
  /**
   * Loads the source text of the locale with the specified name.
   * @param locale The locale to load.
   * @return A promise that resolves with the source text of the specified
   *         locale. If the locale is unknown or the file could not be loaded,
   *         the promise is rejected.
   */
  loadBundle(locale: string): Promise<string>;
}

export type LocaleUpdatedCallback = (locale: string) => void;

export type AvailableLocalesChangedCallback = (
  locales: readonly string[]
) => void;

export const DefaultLocale = 'en';

const getLocaleName = (filePath: string): string => {
  const fileName = path.basename(filePath);
  return fileName.replace(/\.ftl$/, '');
};

const initTranslations = (): Translations => {
  const translationsDir = path.join(path.dirname(__dirname), 'locale');

  const availableLocales =
    fs.readdirSync(translationsDir, {withFileTypes: true})
      .filter(f => f.isFile() && f.name.endsWith('.ftl'))
      .map(f => getLocaleName(f.name))
      .sort();

  // Cache of loaded bundles
  const loaded = new Map<string, string>();

  const loadBundle = (locale: string): Promise<string> => {
    if (!availableLocales.includes(locale)) {
      return Promise.reject(new Error(`Unknown locale: ${locale}`));
    }

    const text = loaded.get(locale);
    if (text !== undefined) {
      return Promise.resolve(text);
    }

    const fileName = path.join(translationsDir, `${locale}.ftl`);
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, {encoding: 'utf-8'}, (err, text) => {
        if (err) {
          reject(err);
        } else {
          loaded.set(locale, text);
          resolve(text);
        }
      });
    });
  };

  ipc.handle('get-locale', (_e, locale) =>
    loadBundle(locale).then(source => ({locale, source}))
  );

  let onLocaleUpdated: LocaleUpdatedCallback | null = null;
  let onAvailableLocalesChanged: AvailableLocalesChangedCallback | null = null;

  // Chokidar globs must use / instead of \, so we need to normalize on Windows.
  const watcher = watch(`${translationsDir.replace(/\\/g, '/')}/*.ftl`, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
    },
  });
  watcher.on('add', file => {
    const locale = getLocaleName(file);
    if (!availableLocales.includes(locale)) {
      availableLocales.push(locale);
      availableLocales.sort();
      onAvailableLocalesChanged?.(availableLocales);
    } else {
      // The locale might have been loaded, then deleted, then readded. In this
      // case we emit it as a change to the locale rather than an addition.
      loaded.delete(locale); // Invalide cached contents
      onLocaleUpdated?.(locale);
    }
  });
  watcher.on('change', file => {
    const locale = getLocaleName(file);
    if (!availableLocales.includes(locale)) {
      // Change event for a locale we haven't seen before? Ignore it.
      return;
    }
    loaded.delete(locale);
    onLocaleUpdated?.(locale);
  });
  watcher.on('unlink', file => {
    const locale = getLocaleName(file);
    if (!availableLocales.includes(locale)) {
      // Unknown locale deleted. Ignore it.
      return;
    }
    // Here we do a bit of special handling. If the locale has already been
    // loaded by the app, we let the app keep using it. Since we have the file
    // contents, there's no point in invalidating the app. This gives us a bit
    // of resilience against delete-then-recreate flows. If the locale is *not*
    // loaded, however, we can safely forget it.
    if (!loaded.has(locale)) {
      const index = availableLocales.indexOf(locale);
      availableLocales.splice(index, 1);
      onAvailableLocalesChanged?.(availableLocales);
    }
  });

  return {
    get availableLocales(): readonly string[] {
      return availableLocales;
    },

    loadBundle,

    get onLocaleUpdated(): LocaleUpdatedCallback | null {
      return onLocaleUpdated;
    },
    set onLocaleUpdated(value: LocaleUpdatedCallback | null) {
      onLocaleUpdated = value;
    },

    get onAvailableLocalesChanged(): AvailableLocalesChangedCallback | null {
      return onAvailableLocalesChanged;
    },
    set onAvailableLocalesChanged(
      value: AvailableLocalesChangedCallback | null
    ) {
      onAvailableLocalesChanged = value;
    },
  };
};

export default initTranslations;
