import {Timing} from './shared';
import {Purple, Red, Gray, FocusHue} from './shades';
import {Theme, ShadeGroup} from './types';

export const lightTheme = (accent: ShadeGroup, danger: ShadeGroup): Theme => ({
  mode: 'light',

  defaultFg: '#000000',
  defaultBg: '#ffffff',
  defaultHoverBg: '#ffffff',
  defaultActiveBg: Gray.bold[0],

  general: Gray.light,
  accent: accent.light,
  danger: danger.light,

  link: {
    link: 'hsl(215, 100%, 40%)',
    visited: 'hsl(275, 60%, 45%)',
    hover: 'hsl(215, 100%, 60%)',
    active: 'hsl(30, 100%, 45%)',
  },

  focus: {
    color: `hsl(${FocusHue}, 95%, 55%)`,
    shadow: `0 0 0 1px hsl(${FocusHue}, 95%, 55%)`,
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.175)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.175)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.175)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.175)',
  },

  timing: Timing,
});

const DefaultLightTheme = lightTheme(Purple, Red);

export default DefaultLightTheme;
