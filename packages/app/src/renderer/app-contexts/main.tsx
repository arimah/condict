import {ReactNode} from 'react';

import {AppConfig, ThemeName, Locale} from '../../types';

// Navigation context is defined elsewhere due to its complexity.
import {NavigationProvider} from '../navigation';
import {ConfigRecipe} from '../types';

import ConfigProvider from './config';
import AppThemeProvider from './theme';
import TranslationProvider from './translations';

export type Props = {
  config: AppConfig;
  initialConfig: AppConfig;
  systemTheme: ThemeName;
  defaultLocale: Locale;
  currentLocale: Locale;
  availableLocales: readonly string[];
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
    availableLocales,
    onUpdateConfig,
    children,
  } = props;
  return (
    <ConfigProvider
      config={config}
      initialConfig={initialConfig}
      onUpdateConfig={onUpdateConfig}
    >
      <TranslationProvider
        defaultLocale={defaultLocale}
        currentLocale={currentLocale}
        availableLocales={availableLocales}
      >
        <AppThemeProvider
          appearance={config.appearance}
          systemTheme={systemTheme}
        >
          <NavigationProvider>
            {children}
          </NavigationProvider>
        </AppThemeProvider>
      </TranslationProvider>
    </ConfigProvider>
  );
};

export default AppContexts;
