import {css} from 'styled-components';
import {theme} from 'styled-tools';

const ThemeSymbol = Symbol('Condict.UI.Theme');

const DefaultIntent = Object.freeze({
  fg: '#000000',
  bg: '#FFFFFF',
  disabledFg: '#000000',
  disabledBg: '#FFFFFF',
  altFg: '#000000',
  altBg: '#FFFFFF',
  activeAltFg: '#000000',
  activeAltBg: '#FFFFFF',
  disabledAltFg: '#000000',
  disabledAltBg: '#FFFFFF',
  borderColor: '#333333',
  disabledBorderColor: '#333333',
});

const DefaultLink = Object.freeze({
  color: '#0000FF',
  visited: '#9900FF',
  hover: '#3333FF',
  active: '#FFA500',
});

const DefaultFocus = Object.freeze({
  color: '#00DDFF', // 500, blue
  style: css`
    box-shadow: 0 0 4px #00DDFF;
    outline: none;
  `,
});

const DefaultSelection = Object.freeze({
  bg: '#00CCFF',
  altBg: '#00CCFF',
  borderColor: '#00CCFF',
});

const DefaultTiming = Object.freeze({
  short: '100ms',
});

const DefaultShadow = Object.freeze({
  color: 'rgba(0, 0, 0, 0.175)',
  elevation1: '0 2px 5px rgba(0, 0, 0, 0.175)',
  elevation2: '0 3px 8px rgba(0, 0, 0, 0.175)',
  elevation3: '0 4px 10px rgba(0, 0, 0, 0.175)',
});

const DefaultTheme = Object.freeze({
  [ThemeSymbol]: true,
  dark: false,
  primary: DefaultIntent,
  secondary: DefaultIntent,
  danger: DefaultIntent,
  general: DefaultIntent,
  link: DefaultLink,
  focus: DefaultFocus,
  selection: DefaultSelection,
  timing: DefaultTiming,
  shadow: DefaultShadow,
});

export const isTheme = theme => theme != null && theme[ThemeSymbol] === true;

export const extendTheme = (baseTheme, newTheme) => {
  if (!isTheme(baseTheme)) {
    throw new Error('Base theme is not a theme');
  }

  const keys = Object.keys(baseTheme);
  return Object.freeze(keys.reduce(
    (theme, key) =>
      Object.assign(theme, {
        [key]: key in newTheme
          ? (
            typeof baseTheme[key] === 'object'
              ? Object.freeze({...baseTheme[key], ...newTheme[key]})
              : newTheme[key]
          ) : baseTheme[key],
      }),
    {[ThemeSymbol]: true}
  ));
};

export const createTheme = theme => extendTheme(DefaultTheme, theme);

export const intentVar = variable => props => props.theme[props.intent][variable];

export const transition =
  (property, duration = null, timingFunc = 'ease-in-out') => css`
    transition-property: ${property};
    transition-duration: ${duration || theme('timing.short')};
    transition-timing-function: ${timingFunc};
  `;
