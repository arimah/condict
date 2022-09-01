import {useState, useCallback, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {webFrame} from 'electron';
import produce, {enableMapSet} from 'immer';

import {AppConfig, ThemeName, Locale, SavedSession} from '../types';

import ipc from './ipc';
import AppContexts from './app-contexts';
import {LoadingScreen, MainScreen} from './screens';
import {ConfigRecipe} from './types';

type Props = {
  initialConfig: AppConfig;
  initialSystemTheme: ThemeName;
  initialLocale: Locale;
  initialDefaultLocale: Locale;
  initialAvailableLocales: readonly string[];
  lastSession: SavedSession | null;
};

const App = (props: Props): JSX.Element => {
  const {
    initialConfig,
    initialSystemTheme,
    initialDefaultLocale,
    initialLocale,
    initialAvailableLocales,
    lastSession,
  } = props;

  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState(initialConfig);
  const [systemTheme, setSystemTheme] = useState(initialSystemTheme);
  const [defaultLocale, setDefaultLocale] = useState(initialDefaultLocale);
  const [currentLocale, setCurrentLocale] = useState(initialLocale);
  const [availableLocales, setAvailableLocales] = useState(
    initialAvailableLocales
  );

  const updateConfig = useCallback((recipe: ConfigRecipe) => {
    setConfig(prevConfig => {
      const nextConfig = produce(prevConfig, recipe);
      void ipc.invoke('set-config', nextConfig);
      return nextConfig;
    });
  }, []);

  useEffect(() => {
    ipc.on('system-theme-change', (_e, systemTheme) => {
      setSystemTheme(systemTheme);
    });

    const defaultLocaleName = defaultLocale.locale;
    ipc.on('locale-updated', (_, localeName) => {
      void ipc.invoke('get-locale', localeName).then(locale => {
        if (defaultLocaleName === locale.locale) {
          setDefaultLocale(locale);
        }

        if (localeConfigRef.current === locale.locale) {
          setCurrentLocale(locale);
        }
      });
    });

    ipc.on('available-locales-changed', (_, locales) => {
      setAvailableLocales(locales);
    });

    void ipc.invoke('window-ready').then(() => {
      setLoading(false);
    });
  }, []);

  const zoomFactor = config.appearance.zoomLevel / 100;
  useEffect(() => {
    if (webFrame.getZoomFactor() !== zoomFactor) {
      webFrame.setZoomFactor(zoomFactor);
    }
  }, [zoomFactor]);

  const localeConfigRef = useRef(config.locale);
  const localeRef = useRef(currentLocale);
  localeConfigRef.current = config.locale;
  localeRef.current = currentLocale;

  useEffect(() => {
    if (localeRef.current?.locale !== config.locale) {
      void ipc.invoke('get-locale', config.locale).then(nextLocale => {
        if (localeConfigRef.current === nextLocale.locale) {
          setCurrentLocale(nextLocale);
        }
      });
    }
  }, [config.locale]);

  return (
    <AppContexts
      config={config}
      initialConfig={initialConfig}
      systemTheme={systemTheme}
      currentLocale={currentLocale}
      defaultLocale={defaultLocale}
      availableLocales={availableLocales}
      lastSession={lastSession}
      onUpdateConfig={updateConfig}
    >
      {loading ? <LoadingScreen/> : <MainScreen/>}
    </AppContexts>
  );
};

// Sigh.
enableMapSet();

void ipc.invoke('get-initial-state').then(state => {
  ReactDOM.render(
    <App
      initialConfig={state.config}
      initialSystemTheme={state.systemTheme}
      initialLocale={state.currentLocale}
      initialDefaultLocale={state.defaultLocale}
      initialAvailableLocales={state.availableLocales}
      lastSession={state.lastSession}
    />,
    document.getElementById('root')
  );
});
