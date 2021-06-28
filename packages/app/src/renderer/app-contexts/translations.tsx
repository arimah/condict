import React, {ReactNode, useMemo, useContext, useEffect} from 'react';
import {FluentBundle, FluentResource} from '@fluent/bundle';
import {LocalizationProvider, ReactLocalization} from '@fluent/react';

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

  const dir = localization.getString('dir');
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', currentLocale.locale);
    html.setAttribute('dir', dir === 'rtl' ? 'rtl' : 'ltr');
  }, [currentLocale, dir]);

  return (
    <LocalizationProvider l10n={localization}>
      <AvailableLocalesContext.Provider value={availableLocales}>
        {children}
      </AvailableLocalesContext.Provider>
    </LocalizationProvider>
  );
};

export default TranslationProvider;

const createBundle = (locale: Locale): FluentBundle => {
  const {locale: localeName, source} = locale;

  const resource = new FluentResource(source);

  const bundle = new FluentBundle(localeName);
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
