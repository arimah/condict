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
  ShadeGroup,
  Red,
  Yellow,
  Green,
  Blue,
  Purple,
  lightTheme,
  darkTheme,
} from '@condict/ui';

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

type ShadeName = 'red' | 'yellow' | 'green' | 'blue' | 'purple';

type ThemeGenerator = typeof lightTheme;

interface ShadeOption {
  readonly value: ShadeName;
  readonly name: string;
}

const ThemeGenerators: Record<ThemeName, ThemeGenerator> = {
  light: lightTheme,
  dark: darkTheme,
};

const Shades: Record<ShadeName, ShadeGroup> = {
  red: Red,
  yellow: Yellow,
  green: Green,
  blue: Blue,
  purple: Purple,
};

const ShadeOptions: readonly ShadeOption[] = [
  {value: 'red', name: 'Red'},
  {value: 'yellow', name: 'Yellow'},
  {value: 'green', name: 'Green'},
  {value: 'blue', name: 'Blue'},
  {value: 'purple', name: 'Purple'},
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
    return themeGen(accent, danger);
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
              label='Dark theme'
              intent='general'
              checked={appearance.theme === 'dark'}
              onChange={handleChangeTheme}
            />
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
