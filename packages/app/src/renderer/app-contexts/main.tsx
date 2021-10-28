import {ReactNode} from 'react';

import {GlobalStyles as UIStyles} from '@condict/ui';

import {AppConfig, ThemeName, Locale} from '../../types';

// Dialog, navigation and data contexts are defined elsewhere
// due to their complexity.
import {DialogStackProvider} from '../dialog-stack';
import {NavigationProvider} from '../navigation';
import {DataProvider} from '../data';
import {ErrorBoundary} from '../ui';
import {ErrorScreen} from '../screens';
import {ConfigRecipe} from '../types';
import {AppStyles} from '../styles';

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
            <ErrorBoundary
              renderError={(e, retry) =>
                <ErrorScreen isGlobalError error={e} onReload={retry}/>
              }
            >
              <DialogStackProvider>
                <NavigationProvider>
                  {children}
                </NavigationProvider>
              </DialogStackProvider>
            </ErrorBoundary>

            <UIStyles/>
            <AppStyles/>
          </DataProvider>
        </AppThemeProvider>
      </TranslationProvider>
    </ConfigProvider>
  );
};

export default AppContexts;
