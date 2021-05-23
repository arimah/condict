import {ReactNode, useMemo} from 'react';
import {ThemeProvider} from 'styled-components';

import {
  ShadeGroup,
  ColorRange,
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

import {AppTheme} from '../types';

export type Props = {
  appearance: AppearanceConfig;
  children: ReactNode;
};

type ThemeBuilder = (
  accent: ShadeGroup,
  danger: ShadeGroup,
  sidebar: ShadeGroup
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
      sidebar: {
        fg: '#ffffff',
        bg: sidebar.bold[6],
        hoverBg: sidebar.bold[5],
        activeBg: sidebar.bold[7],
      },
    };
  },
  dark: (accent, danger, sidebar) => {
    const uiTheme = darkTheme(accent, danger);
    return {
      ...uiTheme,
      sidebar: {
        fg: '#ffffff',
        bg: sidebar.bold[6],
        hoverBg: sidebar.bold[5],
        activeBg: sidebar.bold[7],
      },
    };
  },
};

const AppThemeProvider = (props: Props): JSX.Element => {
  const {appearance, children} = props;

  const {
    theme: themeName,
    accentColor,
    dangerColor,
    sidebarColor,
    motion,
  } = appearance;

  const theme = useMemo(() => {
    let theme = ThemeBuilders[themeName](
      Colors[accentColor],
      Colors[dangerColor],
      Colors[sidebarColor]
    );

    if (motion === 'none') {
      theme = {
        ...theme,
        timing: {
          motion: 'none',
          short: 0,
          long: 0,
        },
      };
    } else if (motion === 'reduced') {
      theme = {
        ...theme,
        timing: {
          motion: 'reduced',
          short: 0,
          long: theme.timing.long,
        },
      };
    }

    return theme;
  }, [themeName, accentColor, dangerColor, sidebarColor, motion]);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
