import fs from 'fs';
import path from 'path';

import ipc from './ipc';

export interface Translations {
  readonly availableLocales: readonly string[];
  loadBundle(language: string): Promise<string>;
}

export const DefaultLocale = 'en';

const initTranslations = (): Translations => {
  const translationsDir = path.join(path.dirname(__dirname), 'locale');

  const availableLocales =
    fs.readdirSync(translationsDir, {withFileTypes: true})
      .filter(f => f.isFile() && f.name.endsWith('.ftl'))
      .map(f => path.basename(f.name).replace(/\.ftl$/, ''))
      .sort();

  // Cache of loaded bundles
  const loaded = new Map<string, string>();

  const loadBundle = (locale: string): Promise<string> => {
    if (!availableLocales.includes(locale)) {
      return Promise.reject(
        new Error(`Invalid translation language: ${locale}`)
      );
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

  return {
    availableLocales,
    loadBundle,
  };
};

export default initTranslations;
