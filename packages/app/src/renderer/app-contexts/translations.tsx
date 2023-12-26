import React, {
  ReactNode,
  useState,
  useMemo,
  useContext,
  useEffect,
} from 'react';
import {FluentBundle, FluentResource} from '@fluent/bundle';
import {LocalizationProvider, ReactLocalization} from '@fluent/react';
import produce from 'immer';

import {
  WritingDirection,
  WritingDirectionProvider,
  ShortcutFormatProvider,
  ShortcutFormatProviderProps,
} from '@condict/ui';

import {Locale} from '../../types';
import ipc from '../ipc';

export type Props = {
  currentLocale: string;
  defaultLocale: string;
  initialLocales: readonly Locale[];
  children: ReactNode;
};

const BundleParentKey = 'extends';
const BundleWritingDirectionKey = 'dir';

type ShortcutFormatProps = Omit<ShortcutFormatProviderProps, 'children'>;

const AvailableLocalesContext = React.createContext<readonly string[]>([]);

const TranslationProvider = (props: Props): JSX.Element => {
  const {defaultLocale, currentLocale, initialLocales, children} = props;

  const [bundles, setBundles] = useState(() =>
    new Map(initialLocales.map(loc =>
      [loc.name, createBundle(loc)]
    ))
  );

  const availableLocales = useMemo<readonly string[]>(
    () => Array.from(bundles.keys()),
    [bundles]
  );

  const localization = useMemo(
    () => createLocalization(bundles, currentLocale, defaultLocale),
    [bundles, currentLocale, defaultLocale]
  );

  useEffect(() => {
    ipc.on('locale-added', (_, locale) => {
      setBundles(produce(draft => {
        if (draft.has(locale.name)) {
          console.warn(
            `Received 'locale-added' event for already known locale: ${
              locale.name
            }`
          );
        }
        draft.set(locale.name, createBundle(locale));
      }));
    });

    ipc.on('locale-updated', (_, locale) => {
      setBundles(produce(draft => {
        if (!draft.has(locale.name)) {
          console.warn(
            `Received 'locale-updated' event for unknown locale: ${
              locale.name
            }`
          );
        }
        draft.set(locale.name, createBundle(locale));
      }));
    });

    ipc.on('locale-deleted', (_, name) => {
      setBundles(produce(draft => {
        if (!draft.delete(name)) {
          console.warn(
            `Received 'locale-deleted' event for unknown locale: ${name}`
          );
        }
      }));
    });
  }, []);

  const dir: WritingDirection =
    localization.getString(BundleWritingDirectionKey) === 'rtl'
      ? 'rtl'
      : 'ltr';
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', currentLocale);
    html.setAttribute('dir', dir);
  }, [currentLocale, dir]);

  const shortcutFormat = useMemo<ShortcutFormatProps>(() => ({
    modifiers: {
      control: localization.getString('key-modifier-control'),
      shift: localization.getString('key-modifier-shift'),
      alt: localization.getString('key-modifier-alt'),
    },
    translateKey: key => localization.getString('key-name', {key}),
  }), [localization]);

  return (
    <LocalizationProvider l10n={localization}>
      <AvailableLocalesContext.Provider value={availableLocales}>
        <WritingDirectionProvider value={dir}>
          <ShortcutFormatProvider {...shortcutFormat}>
            {children}
          </ShortcutFormatProvider>
        </WritingDirectionProvider>
      </AvailableLocalesContext.Provider>
    </LocalizationProvider>
  );
};

export default TranslationProvider;

const createBundle = (locale: Locale): FluentBundle => {
  const {name: localeName, source} = locale;

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

const createLocalization = (
  allBundles: Map<string, FluentBundle>,
  currentLocale: string,
  defaultLocale: string
): ReactLocalization => {
  const selected: FluentBundle[] = [];

  const currentBundle = allBundles.get(currentLocale);
  if (currentBundle) {
    selectBundle(selected, currentBundle);
    selectAncestors(allBundles, selected, currentLocale, currentBundle);
  } else {
    console.warn(`Could not resolve current locale: ${currentLocale}`);
  }

  // Note: The default bundle cannot have a parent locale, hence we never even
  // attempt to process it here.
  const defaultBundle = allBundles.get(defaultLocale);
  if (defaultBundle) {
    selectBundle(selected, defaultBundle);
  } else {
    console.error(`Could not resolve default locale: ${defaultLocale}`);
  }

  return new ReactLocalization(selected);
};

const selectBundle = (
  selected: FluentBundle[],
  bundle: FluentBundle
): boolean => {
  if (!selected.includes(bundle)) {
    selected.push(bundle);
    return true;
  }
  return false;
};

const selectAncestors = (
  allBundles: Map<string, FluentBundle>,
  selected: FluentBundle[],
  currentLocale: string,
  currentBundle: FluentBundle
): void => {
  const inheritanceChain = [currentLocale];
  let parentLocale = getParentLocale(currentBundle);
  while (parentLocale) {
    const parentBundle = allBundles.get(parentLocale);
    if (!parentBundle) {
      // The most recent child locale, i.e. the locale we're attempting to
      // resolve a parent for.
      const childLocale = inheritanceChain.at(-1);
      console.warn(
        `Could not resolve locale: ${
          parentLocale
        } (required by '${
          childLocale
        }')`
      );
      break;
    }

    // Add it to the inheritance chain now so it's clearer where the loop is
    // if there is one. The message in case of a loop will look like this:
    //
    //   aa < bb < cc < aa
    //
    // as opposed to:
    //
    //   aa < bb < cc
    //
    // In the former case, it is hopefully more obvious that 'cc' extends 'aa'.
    inheritanceChain.push(parentLocale);

    if (!selectBundle(selected, parentBundle)) {
      console.warn(
        `Locale ${parentLocale} extends itself: ${
          inheritanceChain.join(' < ')
      }`);
      break;
    }

    parentLocale = getParentLocale(parentBundle);
  }
};

const getParentLocale = (bundle: FluentBundle): string | null => {
  const parent = bundle.getMessage(BundleParentKey);
  if (!parent || !parent.value) {
    return null;
  }
  return bundle.formatPattern(parent.value);
};

export const useAvailableLocales = (): readonly string[] =>
  useContext(AvailableLocalesContext);
