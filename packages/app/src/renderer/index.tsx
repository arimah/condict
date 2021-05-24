import {useState, useCallback, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {webFrame} from 'electron';
import produce from 'immer';

import {GlobalStyles as UIStyles} from '@condict/ui';

import {AppConfig, ThemeName} from '../types';

import ipc from './ipc';
import AppContexts from './app-contexts';
import {LoadingScreen, MainScreen} from './screens';
import {ConfigRecipe} from './types';
import * as S from './styles';

type Props = {
  initialConfig: AppConfig;
  initialSystemTheme: ThemeName;
};

const App = (props: Props): JSX.Element => {
  const {initialConfig, initialSystemTheme} = props;

  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState(initialConfig);
  const [systemTheme, setSystemTheme] = useState(initialSystemTheme);

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

  return (
    <AppContexts
      config={config}
      initialConfig={initialConfig}
      systemTheme={systemTheme}
      onUpdateConfig={updateConfig}
    >
      {loading ? <LoadingScreen/> : <MainScreen/>}

      <UIStyles/>
      <S.AppStyles/>
    </AppContexts>
  );
};

void ipc.invoke('get-initial-state').then(({config, systemTheme}) => {
  ReactDOM.render(
    <App initialConfig={config} initialSystemTheme={systemTheme}/>,
    document.getElementById('root')
  );
});
