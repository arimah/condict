import {ReactNode, useMemo} from 'react';
import {FluentBundle, FluentResource} from '@fluent/bundle';
import {LocalizationProvider, ReactLocalization} from '@fluent/react';

import {Locale} from '../../types';

export type Props = {
  defaultLocale: Locale;
  currentLocale: Locale;
  children: ReactNode;
};

const TranslationProvider = (props: Props): JSX.Element => {
  const {defaultLocale, currentLocale, children} = props;

  const defaultBundle = useMemo(
    () => createBundle(defaultLocale),
    // The default locale should never change.
    []
  );

  const currentBundle = useMemo(
    () => createBundle(currentLocale),
    [currentLocale]
  );

  const localization = useMemo(
    () => new ReactLocalization([currentBundle, defaultBundle]),
    [currentBundle]
  );

  return (
    <LocalizationProvider l10n={localization}>
      {children}
    </LocalizationProvider>
  );
};

export default TranslationProvider;

const createBundle = (locale: Locale): FluentBundle => {
  const {locale: localeName, source} = locale;

  const resource = new FluentResource(source);

  const bundle = new FluentBundle(localeName);
  const errors = bundle.addResource(resource);
  if (errors) {
    console.error(
      `Errors in locale '${localeName}':`,
      errors.map(e => e.message)
    );
  }

  return bundle;
};
