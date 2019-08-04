import {css} from 'styled-components';
import {theme} from 'styled-tools';

export interface Theme {
  readonly dark: boolean;
  readonly primary: IntentTheme;
  readonly secondary: IntentTheme;
  readonly danger: IntentTheme;
  readonly general: IntentTheme;
  readonly link: LinkTheme;
  readonly focus: FocusTheme;
  readonly selection: SelectionTheme;
  readonly timing: TimingTheme;
  readonly shadow: ShadowTheme;
}

export interface IntentTheme {
  readonly fg: string;
  readonly bg: string;
  readonly hoverBg: string;
  readonly activeBg: string;
  readonly disabledFg: string;
  readonly disabledBg: string;
  readonly altFg: string;
  readonly altBg: string;
  readonly hoverAltBg: string;
  readonly activeAltFg: string;
  readonly activeAltBg: string;
  readonly disabledAltFg: string;
  readonly disabledAltBg: string;
  readonly borderColor: string;
  readonly disabledBorderColor: string;
}

export interface LinkTheme {
  readonly color: string;
  readonly visited: string;
  readonly hover: string;
  readonly active: string;
}

export interface FocusTheme {
  readonly color: string;
  readonly style: string;
}

export interface SelectionTheme {
  readonly bg: string;
  readonly altBg: string;
  readonly borderColor: string;
}

export interface TimingTheme {
  readonly short: string;
}

export interface ShadowTheme {
  readonly color: string;
  readonly elevation1: string;
  readonly elevation2: string;
  readonly elevation3: string;
}

export type PartialTheme = Partial<{
  [K in keyof Theme]: Partial<Theme[K]>;
}>;

const DefaultIntent: IntentTheme = Object.freeze({
  fg: '#000000',
  bg: '#FFFFFF',
  hoverBg: '#FFFFFF',
  activeBg: '#FFFFFF',
  disabledFg: '#000000',
  disabledBg: '#FFFFFF',
  altFg: '#000000',
  altBg: '#FFFFFF',
  hoverAltBg: '#FFFFFF',
  activeAltFg: '#000000',
  activeAltBg: '#FFFFFF',
  disabledAltFg: '#000000',
  disabledAltBg: '#FFFFFF',
  borderColor: '#333333',
  disabledBorderColor: '#333333',
});

const DefaultLink: LinkTheme = Object.freeze({
  color: '#0000FF',
  visited: '#9900FF',
  hover: '#3333FF',
  active: '#FFA500',
});

const DefaultFocus: FocusTheme = Object.freeze({
  color: '#00DDFF', // 500, blue
  style: `
    box-shadow: 0 0 4px #00DDFF;
    outline: none;
  `,
});

const DefaultSelection: SelectionTheme = Object.freeze({
  bg: '#00CCFF',
  altBg: '#00CCFF',
  borderColor: '#00CCFF',
});

const DefaultTiming: TimingTheme = Object.freeze({
  short: '100ms',
});

const DefaultShadow: ShadowTheme = Object.freeze({
  color: 'rgba(0, 0, 0, 0.175)',
  elevation1: '0 2px 5px rgba(0, 0, 0, 0.175)',
  elevation2: '0 3px 8px rgba(0, 0, 0, 0.175)',
  elevation3: '0 4px 10px rgba(0, 0, 0, 0.175)',
});

const DefaultTheme: Theme = Object.freeze({
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

export const extendTheme = (baseTheme: Theme, newTheme: PartialTheme) => {
  const keys = Object.keys(baseTheme);
  return Object.freeze(keys.reduce<Theme>(
    (theme: any, key: string) => {
      const baseProp = (baseTheme as any)[key];
      const newProp = (newTheme as any)[key];
      theme[key] = key in newTheme
        ? (
          typeof baseProp === 'object'
            ? Object.freeze({...baseProp, ...newProp})
            : newProp
        ) : baseProp;
      return theme;
    },
    {} as any
  ));
};

export const createTheme = (theme: PartialTheme) => extendTheme(DefaultTheme, theme);

export interface IntentProps {
  intent: 'primary' | 'secondary' | 'danger' | 'general';
  theme: Theme;
}

export const intentVar =
  (variable: keyof IntentTheme) =>
    (props: IntentProps) =>
      props.theme[props.intent][variable];

export const transition = (
  property: string,
  duration: string | null = null,
  timingFunc: string = 'ease-in-out'
) => css`
  transition-property: ${property};
  transition-duration: ${duration || theme('timing.short')};
  transition-timing-function: ${timingFunc};
`;
