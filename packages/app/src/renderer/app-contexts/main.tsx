import {ReactNode} from 'react';

import {AppConfig, ThemeName, Locale} from '../../types';

import {ConfigRecipe} from '../types';

import ConfigProvider from './config';
import AppThemeProvider from './theme';
import TranslationProvider from './translations';

export type Props = {
  config: AppConfig;
  initialConfig: AppConfig;
  systemTheme: ThemeName;
  defaultLocale: Locale,
  currentLocale: Locale,
  onUpdateConfig: (recipe: ConfigRecipe) => void;
  children: ReactNode;
};

const AppContexts = (props: Props): JSX.Element => {
  const {
    config,
    initialConfig,
    systemTheme,
    defaultLocale,
    currentLocale,
    onUpdateConfig,
    children,
  } = props;
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
        <TranslationProvider
          defaultLocale={defaultLocale}
          currentLocale={currentLocale}
        >
          {children}
        </TranslationProvider>
      </AppThemeProvider>
    </ConfigProvider>
  );
};

export default AppContexts;
