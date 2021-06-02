import {useState, useCallback, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {webFrame} from 'electron';
import produce from 'immer';

import {GlobalStyles as UIStyles} from '@condict/ui';

import {AppConfig, ThemeName, Locale} from '../types';

import ipc from './ipc';
import AppContexts from './app-contexts';
import {LoadingScreen, MainScreen} from './screens';
import {ConfigRecipe} from './types';
import * as S from './styles';

type Props = {
  initialConfig: AppConfig;
  initialSystemTheme: ThemeName;
  defaultLocale: Locale;
  initialLocale: Locale;
  availableLocales: readonly string[];
};

const App = (props: Props): JSX.Element => {
  const {
    initialConfig,
    initialSystemTheme,
    defaultLocale,
    initialLocale,
    availableLocales,
  } = props;

  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState(initialConfig);
  const [systemTheme, setSystemTheme] = useState(initialSystemTheme);
  const [currentLocale, setCurrentLocale] = useState(initialLocale);

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
      defaultLocale={defaultLocale}
      currentLocale={currentLocale}
      availableLocales={availableLocales}
      onUpdateConfig={updateConfig}
    >
      {loading ? <LoadingScreen/> : <MainScreen/>}

      <UIStyles/>
      <S.AppStyles/>
    </AppContexts>
  );
};

void ipc.invoke('get-initial-state').then(state => {
  ReactDOM.render(
    <App
      initialConfig={state.config}
      initialSystemTheme={state.systemTheme}
      defaultLocale={state.defaultLocale}
      initialLocale={state.currentLocale}
      availableLocales={state.availableLocales}
    />,
    document.getElementById('root')
  );
});
