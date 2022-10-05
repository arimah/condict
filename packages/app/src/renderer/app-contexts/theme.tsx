import {ReactNode, useMemo} from 'react';
import {ThemeProvider} from 'styled-components';

import {
  Theme,
  ThemeVariables,
  Shade,
  Red,
  Orange,
  Yellow,
  Green,
  Teal,
  Blue,
  Purple,
  Gray,
  DefaultTiming,
  lightThemeVars,
  darkThemeVars,
  fontSizeVars,
} from '@condict/ui';
import {
  lightThemeVars as lightThemeTableVars,
  darkThemeVars as darkThemeTableVars,
} from '@condict/table-editor';

import {ThemeName, UserTheme, ColorName, AppearanceConfig} from '../../types';

import {
  SidebarColors,
  lightThemeVars as lightThemeAppVars,
  darkThemeVars as darkThemeAppVars,
} from '../theme';

export type Props = {
  appearance: AppearanceConfig;
  systemTheme: ThemeName;
  userTheme: UserTheme | null;
  children: ReactNode;
};

type ThemeBuilder = (
  accent: Shade,
  danger: Shade,
  sidebar: ColorName
) => ThemeVariables;

const Colors: Record<ColorName, Shade> = {
  red: Red,
  orange: Orange,
  yellow: Yellow,
  green: Green,
  teal: Teal,
  blue: Blue,
  purple: Purple,
  gray: Gray,
};

const ThemeBuilders: Record<ThemeName, ThemeBuilder> = {
  light: (accent, danger, sidebar) => ({
    ...lightThemeVars(accent, danger),
    ...lightThemeTableVars(accent),
    ...lightThemeAppVars(accent),
    ...SidebarColors[sidebar],
  }),
  dark: (accent, danger, sidebar) => ({
    ...darkThemeVars(accent, danger),
    ...darkThemeTableVars(accent),
    ...darkThemeAppVars(accent),
    ...SidebarColors[sidebar],
  }),
};

const AppThemeProvider = (props: Props): JSX.Element => {
  const {appearance, systemTheme, userTheme, children} = props;

  const {
    theme: themePreference,
    accentColor,
    dangerColor,
    sidebarColor,
    fontSize,
    lineHeight,
    motion,
  } = appearance;

  const themeVars = useMemo<ThemeVariables>(() => {
    let themeName: ThemeName;
    if (userTheme) {
      themeName = userTheme.extends;
    } else {
      themeName = themePreference === 'system'
        ? systemTheme
        : themePreference;
    }

    let vars = ThemeBuilders[themeName](
      Colors[accentColor],
      Colors[dangerColor],
      sidebarColor
    );

    if (userTheme) {
      vars = {...vars, ...userTheme.vars};
    }
    return vars;
  }, [
    themePreference,
    systemTheme,
    userTheme,
    accentColor,
    dangerColor,
    sidebarColor,
  ]);

  const fontVars = useMemo<ThemeVariables>(() => {
    return fontSizeVars(fontSize, lineHeight);
  }, [fontSize, lineHeight]);

  const theme = useMemo<Theme>(() => {
    let timing = DefaultTiming;
    if (motion === 'none') {
      timing = {
        ...DefaultTiming,
        motion,
        short: 0,
        long: 0,
      };
    } else if (motion === 'reduced') {
      timing = {
        ...DefaultTiming,
        motion,
        short: 0,
      };
    }

    return {vars: {...themeVars, ...fontVars}, timing};
  }, [themeVars, fontVars, motion]);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
