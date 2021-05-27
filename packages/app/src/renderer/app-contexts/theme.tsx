import {ReactNode, useMemo} from 'react';
import {ThemeProvider} from 'styled-components';

import {
  ShadeGroup,
  Red,
  Yellow,
  Green,
  Blue,
  Purple,
  Gray,
  lightTheme,
  darkTheme,
} from '@condict/ui';

import {ThemeName, ColorName, AppearanceConfig} from '../../types';

import {SidebarColors} from '../ui';
import {AppTheme, SidebarColors as SidebarColorGroup} from '../types';

export type Props = {
  appearance: AppearanceConfig;
  systemTheme: ThemeName;
  children: ReactNode;
};

type ThemeBuilder = (
  accent: ShadeGroup,
  danger: ShadeGroup,
  sidebar: SidebarColorGroup
) => AppTheme;

const Colors: Record<ColorName, ShadeGroup> = {
  red: Red,
  yellow: Yellow,
  green: Green,
  blue: Blue,
  purple: Purple,
  gray: Gray,
};

const ThemeBuilders: Record<ThemeName, ThemeBuilder> = {
  light: (accent, danger, sidebar) => {
    const uiTheme = lightTheme(accent, danger);
    return {
      ...uiTheme,
      sidebar,
    };
  },
  dark: (accent, danger, sidebar) => {
    const uiTheme = darkTheme(accent, danger);
    return {
      ...uiTheme,
      sidebar,
    };
  },
};

const AppThemeProvider = (props: Props): JSX.Element => {
  const {appearance, systemTheme, children} = props;

  const {
    theme: themePreference,
    accentColor,
    dangerColor,
    sidebarColor,
    motion,
  } = appearance;

  const theme = useMemo(() => {
    const themeName = themePreference === 'system'
      ? systemTheme
      : themePreference;
    let theme = ThemeBuilders[themeName](
      Colors[accentColor],
      Colors[dangerColor],
      SidebarColors[sidebarColor]
    );

    if (motion === 'none') {
      theme = {
        ...theme,
        timing: {
          motion,
          short: 0,
          long: 0,
        },
      };
    } else if (motion === 'reduced') {
      theme = {
        ...theme,
        timing: {
          motion,
          short: 0,
          long: theme.timing.long,
        },
      };
    }

    return theme;
  }, [
    themePreference,
    systemTheme,
    accentColor,
    dangerColor,
    sidebarColor,
    motion,
  ]);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
