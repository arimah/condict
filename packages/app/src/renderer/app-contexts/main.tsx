import {ReactNode} from 'react';

import {AppConfig, ThemeName, Locale} from '../../types';

// Dialog, navigation and data contexts are defined elsewhere
// due to their complexity.
import {DialogStackProvider} from '../dialog-stack';
import {NavigationProvider} from '../navigation';
import {DataProvider} from '../data';
import {ConfigRecipe} from '../types';

import ConfigProvider from './config';
import AppThemeProvider from './theme';
import TranslationProvider from './translations';

export type Props = {
  config: AppConfig;
  initialConfig: AppConfig;
  systemTheme: ThemeName;
  currentLocale: Locale;
  defaultLocale: Locale;
  availableLocales: readonly string[];
  onUpdateConfig: (recipe: ConfigRecipe) => void;
  children: ReactNode;
};

const AppContexts = (props: Props): JSX.Element => {
  const {
    config,
    initialConfig,
    systemTheme,
    currentLocale,
    defaultLocale,
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
        currentLocale={currentLocale}
        defaultLocale={defaultLocale}
        availableLocales={availableLocales}
      >
        <AppThemeProvider
          appearance={config.appearance}
          systemTheme={systemTheme}
        >
          <DataProvider>
            <DialogStackProvider>
              <NavigationProvider>
                {children}
              </NavigationProvider>
            </DialogStackProvider>
          </DataProvider>
        </AppThemeProvider>
      </TranslationProvider>
    </ConfigProvider>
  );
};

export default AppContexts;
