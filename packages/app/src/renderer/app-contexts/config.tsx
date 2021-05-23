import React, {ReactNode, useMemo, useContext} from 'react';
import shallowEqual from 'shallowequal';

import {AppConfig} from '../../types';

import {ConfigRecipe} from '../types';

import {ConfigContextValue} from './types';

export type Props = {
  config: AppConfig;
  initialConfig: AppConfig;
  onUpdateConfig: (recipe: ConfigRecipe) => void;
  children: ReactNode;
};

const ConfigContext = React.createContext<ConfigContextValue>({
  get config(): never {
    throw new Error('No config available');
  },
  updateConfig(): never {
    throw new Error('No config available');
  },
  get needsRestart(): never {
    throw new Error('No config available');
  },
});

const ConfigProvider = (props: Props): JSX.Element => {
  const {initialConfig, config, onUpdateConfig, children} = props;

  const value = useMemo<ConfigContextValue>(() => ({
    config,
    updateConfig: onUpdateConfig,
    needsRestart: needsRestart(initialConfig, config),
  }), [config, initialConfig, onUpdateConfig]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;

const needsRestart = (initial: AppConfig, current: AppConfig): boolean => {
  if (initial.server !== current.server) {
    const initialServer = initial.server;
    const currentServer = current.server;
    switch (currentServer.kind) {
      case 'local':
        if (
          initialServer.kind !== 'local' ||
          !shallowEqual(currentServer.database, initialServer.database)
        ) {
          return true;
        }
        break;
      case 'remote':
        if (
          initialServer.kind !== 'remote' ||
          currentServer.url !== initialServer.url
        ) {
          return true;
        }
        break;
    }
  }
  return true;
};

export const useConfig = (): ConfigContextValue => useContext(ConfigContext);
