import React, {ReactNode, useMemo, useContext, useEffect} from 'react';
import {FluentBundle, FluentResource} from '@fluent/bundle';
import {LocalizationProvider, ReactLocalization} from '@fluent/react';

import {WritingDirection, WritingDirectionProvider} from '@condict/ui';

import {Locale} from '../../types';

export type Props = {
  currentLocale: Locale;
  defaultLocale: Locale;
  availableLocales: readonly string[];
  children: ReactNode;
};

const AvailableLocalesContext = React.createContext<readonly string[]>([]);

const TranslationProvider = (props: Props): JSX.Element => {
  const {defaultLocale, currentLocale, availableLocales, children} = props;

  const defaultBundle = useMemo(
    () => createBundle(defaultLocale),
    [defaultLocale]
  );

  const currentBundle = useMemo(
    () => createBundle(currentLocale),
    [currentLocale]
  );

  const localization = useMemo(
    () => new ReactLocalization([currentBundle, defaultBundle]),
    [currentBundle, defaultBundle]
  );

  const dir: WritingDirection =
    localization.getString('dir') === 'rtl'
      ? 'rtl'
      : 'ltr';
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', currentLocale.locale);
    html.setAttribute('dir', dir);
  }, [currentLocale, dir]);

  return (
    <LocalizationProvider l10n={localization}>
      <AvailableLocalesContext.Provider value={availableLocales}>
        <WritingDirectionProvider value={dir}>
          {children}
        </WritingDirectionProvider>
      </AvailableLocalesContext.Provider>
    </LocalizationProvider>
  );
};

export default TranslationProvider;

const createBundle = (locale: Locale): FluentBundle => {
  const {locale: localeName, source} = locale;

  const resource = new FluentResource(source);

  const bundle = new FluentBundle(localeName, {
    useIsolating: false,
  });
  const errors = bundle.addResource(resource);
  if (errors.length > 0) {
    console.error(
      `Errors in locale '${localeName}':`,
      errors.map(e => e.message)
    );
  }

  return bundle;
};

export const useAvailableLocales = (): readonly string[] =>
  useContext(AvailableLocalesContext);
