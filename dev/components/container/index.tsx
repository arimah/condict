import React, {
  ReactNode,
  ChangeEvent,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {ThemeProvider} from 'styled-components';
import {useRouter} from 'next/router';
import Link from 'next/link';

import {
  Switch,
  Intent,
  GlobalStyles,
  Theme,
  LightTheme,
  DarkTheme,
} from '@condict/ui';

import * as S from './styles';

export type Props = {
  children?: ReactNode;
};

type ThemeName = 'light' | 'dark';

const Themes: Record<ThemeName, Theme> = {
  light: LightTheme,
  dark: DarkTheme,
};

const ThemeKey = 'condict/theme';

const loadTheme = (): ThemeName => {
  try {
    if (typeof localStorage !== 'undefined') {
      const storedValue = localStorage.getItem(ThemeKey);
      switch (storedValue) {
        case 'light':
        case 'dark':
          return storedValue;
      }
    }
    return 'light'; // default fallback value
  } catch (e) {
    return 'light';
  }
};

const saveTheme = (theme: ThemeName): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ThemeKey, theme);
    }
  } catch (e) {
    // ignore
  }
};

const Container = (props: Props): JSX.Element | null => {
  const {children} = props;

  const {route} = useRouter();

  const [theme, setTheme] = useState<ThemeName | null>(null);
  const handleChangeTheme = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  }, []);

  useEffect(() => {
    setTheme(loadTheme());
  }, []);

  if (theme === null) {
    return null;
  }

  return (
    <ThemeProvider theme={Themes[theme]}>
      <S.Container>
        <S.Header>
          <h1>Condict UI components</h1>

          <S.HeaderSwitch>
            <Switch
              label='Dark theme'
              intent='secondary'
              checked={theme === 'dark'}
              onChange={handleChangeTheme}
            />
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
