import {useState, useCallback, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {webFrame} from 'electron';
import produce, {enableMapSet} from 'immer';

import {AppConfig, ThemeName, UserTheme, Locale, SavedSession} from '../types';

import ipc from './ipc';
import AppContexts from './app-contexts';
import {LoadingScreen, MainScreen} from './screens';
import {ConfigRecipe} from './types';

type Props = {
  initialConfig: AppConfig;
  initialSystemTheme: ThemeName;
  initialUserTheme: UserTheme | null;
  initialAvailableLocales: readonly Locale[];
  defaultLocale: string;
  lastSession: SavedSession | null;
};

const App = (props: Props): JSX.Element => {
  const {
    initialConfig,
    initialSystemTheme,
    initialUserTheme,
    initialAvailableLocales,
    defaultLocale,
    lastSession,
  } = props;

  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState(initialConfig);
  const [systemTheme, setSystemTheme] = useState(initialSystemTheme);
  const [userTheme, setUserTheme] = useState(initialUserTheme);
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

    ipc.on('user-theme-change', (_e) => {
      void ipc.invoke('get-user-theme').then(userTheme => {
        setUserTheme(userTheme);
      });
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

  return (
    <AppContexts
      config={config}
      initialConfig={initialConfig}
      systemTheme={systemTheme}
      userTheme={userTheme}
      defaultLocale={defaultLocale}
      initialLocales={availableLocales}
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
      initialUserTheme={state.userTheme}
      initialAvailableLocales={state.availableLocales}
      defaultLocale={state.defaultLocale}
      lastSession={state.lastSession}
    />,
    document.getElementById('root')
  );
});
