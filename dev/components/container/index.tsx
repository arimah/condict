import React, {
  ReactNode,
  ChangeEvent,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {ThemeProvider} from 'styled-components';
import {useRouter} from 'next/router';
import Link from 'next/link';

import {
  Switch,
  Select,
  GlobalStyles,
  Theme,
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

import * as S from './styles';

export type Props = {
  children?: ReactNode;
};

interface Appearance {
  theme: ThemeName;
  accent: ShadeName;
  danger: ShadeName;
}

type ThemeName = 'light' | 'dark';

type ShadeName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'gray';

interface ThemeGenerator {
  readonly ui: typeof lightThemeVars;
  readonly table: typeof lightThemeTableVars;
}

interface ShadeOption {
  readonly value: ShadeName;
  readonly name: string;
}

const ThemeGenerators: Record<ThemeName, ThemeGenerator> = {
  light: {
    ui: lightThemeVars,
    table: lightThemeTableVars,
  },
  dark: {
    ui: darkThemeVars,
    table: darkThemeTableVars,
  },
};

const Shades: Record<ShadeName, Shade> = {
  red: Red,
  orange: Orange,
  yellow: Yellow,
  green: Green,
  teal: Teal,
  blue: Blue,
  purple: Purple,
  gray: Gray,
};

const ShadeOptions: readonly ShadeOption[] = [
  {value: 'red', name: 'Red'},
  {value: 'orange', name: 'Orange'},
  {value: 'yellow', name: 'Yellow'},
  {value: 'green', name: 'Green'},
  {value: 'teal', name: 'Teal'},
  {value: 'blue', name: 'Blue'},
  {value: 'purple', name: 'Purple'},
  {value: 'gray', name: 'Gray'},
];

const AppearanceKey = 'condict/appearance';

const DefaultAppearance: Appearance = {
  theme: 'light',
  accent: 'purple',
  danger: 'red',
};

const loadAppearance = (): Appearance => {
  try {
    if (typeof localStorage !== 'undefined') {
      const json = localStorage.getItem(AppearanceKey);
      if (json != null) {
        return JSON.parse(json) as Appearance;
      }
    }
  } catch (e) {
    // ignore
  }
  return DefaultAppearance;
};

const saveAppearance = (appearance: Appearance): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      const json = JSON.stringify(appearance);
      localStorage.setItem(AppearanceKey, json);
    }
  } catch (e) {
    // ignore
  }
};

const Container = (props: Props): JSX.Element | null => {
  const {children} = props;

  const {route} = useRouter();

  const [appearance, setAppearance] = useState<Appearance | null>(null);

  const handleChangeTheme = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newTheme: ThemeName = e.target.checked ? 'dark' : 'light';
    setAppearance(app => {
      const nextAppearance = {
        ...app,
        theme: newTheme,
      };
      saveAppearance(nextAppearance);
      return nextAppearance;
    });
  }, []);

  const handleChangeAccent = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const newAccent = e.target.value as ShadeName;
    setAppearance(app => {
      const nextAppearance = {
        ...app,
        accent: newAccent,
      };
      saveAppearance(nextAppearance);
      return nextAppearance;
    });
  }, []);

  const handleChangeDanger = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const newDanger = e.target.value as ShadeName;
    setAppearance(app => {
      const nextAppearance = {
        ...app,
        danger: newDanger,
      };
      saveAppearance(nextAppearance);
      return nextAppearance;
    });
  }, []);

  useEffect(() => {
    setAppearance(loadAppearance());
  }, []);

  const theme = useMemo<Theme | null>(() => {
    if (appearance === null) {
      return null;
    }

    const themeGen = ThemeGenerators[appearance.theme];
    const accent = Shades[appearance.accent];
    const danger = Shades[appearance.danger];
    return {
      vars: {
        ...themeGen.ui(accent, danger),
        ...themeGen.table(accent),
        ...fontSizeVars('14', '1.5'),
      },
      timing: DefaultTiming,
    };
  }, [appearance]);

  if (appearance === null || theme === null) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <S.Container>
        <S.Header>
          <h1>Condict UI components</h1>

          <S.HeaderSwitch>
            <Switch
              checked={appearance.theme === 'dark'}
              onChange={handleChangeTheme}
            >
              Dark theme
            </Switch>
            <label>
              {'Accent colour: '}
              <Select
                options={ShadeOptions}
                value={appearance.accent}
                onChange={handleChangeAccent}
              />
            </label>
            <label>
              {'Danger colour: '}
              <Select
                options={ShadeOptions}
                value={appearance.danger}
                onChange={handleChangeDanger}
              />
            </label>
          </S.HeaderSwitch>
        </S.Header>

        <S.MainNav>
          <Link href='/ui'>
            <a className={/^\/ui(?=$|\/)/.test(route) ? 'current' : ''}>
              Generic components
            </a>
          </Link>
          <S.NavSeparator/>
          <Link href='/table-editor'>
            <a className={/^\/table-editor(?=$|\/)/.test(route) ? 'current' : ''}>
              Table editor
            </a>
          </Link>
          <S.NavSeparator/>
          <Link href='/rich-text-editor'>
            <a className={/^\/rich-text-editor(?=$|\/)/.test(route) ? 'current' : ''}>
              Rich text editor
            </a>
          </Link>
        </S.MainNav>

        {children}
      </S.Container>
      <GlobalStyles/>
      <S.AppStyles/>
    </ThemeProvider>
  );
};

export default Container;
