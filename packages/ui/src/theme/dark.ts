import {Timing} from './shared';
import {Purple, Red, Gray, FocusHue} from './shades';
import {Theme, ShadeGroup} from './types';

export const darkTheme = (accent: ShadeGroup, danger: ShadeGroup): Theme => ({
  mode: 'dark',

  defaultFg: '#ffffff',
  defaultBg: '#1e2024',
  defaultHoverBg: Gray.bold[7],
  defaultActiveBg: '#151619',

  general: Gray.dark,
  accent: accent.dark,
  danger: danger.dark,

  link: {
    link: 'hsl(215, 100%, 80%)',
    visited: 'hsl(275, 60%, 75%)',
    hover: 'hsl(215, 100%, 90%)',
    active: 'hsl(30, 100%, 75%)',
  },

  focus: {
    color: `hsl(${FocusHue}, 95%, 55%)`,
    shadow: `0 0 0 1px hsl(${FocusHue}, 95%, 55%)`,
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.67)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.67)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.67)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.67)',
  },

  timing: Timing,
});

const DefaultDarkTheme = darkTheme(Purple, Red);

export default DefaultDarkTheme;
