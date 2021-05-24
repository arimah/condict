import {ReactNode} from 'react';

import {AppConfig, ThemeName} from '../../types';

import {ConfigRecipe} from '../types';

import ConfigProvider from './config';
import AppThemeProvider from './theme';

export type Props = {
  config: AppConfig;
  initialConfig: AppConfig;
  systemTheme: ThemeName;
  onUpdateConfig: (recipe: ConfigRecipe) => void;
  children: ReactNode;
};

const AppContexts = (props: Props): JSX.Element => {
  const {config, initialConfig, systemTheme, onUpdateConfig, children} = props;
  return (
    <ConfigProvider
      config={config}
      initialConfig={initialConfig}
      onUpdateConfig={onUpdateConfig}
    >
      <AppThemeProvider
        appearance={config.appearance}
        systemTheme={systemTheme}
      >
        {children}
      </AppThemeProvider>
    </ConfigProvider>
  );
};

export default AppContexts;
