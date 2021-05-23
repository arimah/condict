import {useState, useCallback, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {webFrame} from 'electron';
import produce from 'immer';

import {GlobalStyles as UIStyles} from '@condict/ui';

import {AppConfig} from '../types';

import ipc from './ipc';
import AppContexts from './app-contexts';
import {LoadingScreen, MainScreen} from './screens';
import {ConfigRecipe} from './types';
import * as S from './styles';

type Props = {
  initialConfig: AppConfig;
};

const App = (props: Props): JSX.Element => {
  const {initialConfig} = props;

  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState(initialConfig);

  const updateConfig = useCallback((recipe: ConfigRecipe) => {
    setConfig(prevConfig => {
      const nextConfig = produce(prevConfig, recipe);
      void ipc.invoke('set-config', nextConfig);
      return nextConfig;
    });
  }, []);

  useEffect(() => {
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
      onUpdateConfig={updateConfig}
    >
      {loading ? <LoadingScreen/> : <MainScreen/>}

      <UIStyles/>
      <S.AppStyles/>
    </AppContexts>
  );
};

void ipc.invoke('get-config').then(config => {
  ReactDOM.render(
    <App initialConfig={config}/>,
    document.getElementById('root')
  );
});
