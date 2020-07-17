import {Theme, IntentTheme} from './types';

const DefaultIntent: IntentTheme = {
  fg: '#000000',
  bg: '#FFFFFF',
  hoverBg: '#FFFFFF',
  activeBg: '#FFFFFF',
  disabledFg: '#000000',
  disabledBg: '#FFFFFF',
  altFg: '#000000',
  altBg: '#FFFFFF',
  hoverAltBg: '#FFFFFF',
  activeAltBg: '#FFFFFF',
  disabledAltFg: '#000000',
  disabledAltBg: '#FFFFFF',
  borderColor: '#333333',
  disabledBorderColor: '#333333',
};

const DefaultTheme: Theme = {
  dark: false,
  primary: DefaultIntent,
  secondary: DefaultIntent,
  danger: DefaultIntent,
  general: DefaultIntent,
  link: {
    color: '#0000FF',
    visited: '#9900FF',
    hover: '#3333FF',
    active: '#FFA500',
  },
  focus: {
    color: '#00DDFF', // 500, blue
    style: `
      box-shadow: 0 0 4px #00DDFF;
      outline: none;
    `,
  },
  selection: {
    bg: '#00CCFF',
    altBg: '#00CCFF',
    borderColor: '#00CCFF',
  },
  timing: {
    short: 100,
    long: 250,
  },
  shadow: {
    color: 'rgba(0, 0, 0, 0.175)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.175)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.175)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.175)',
  },
};

export default DefaultTheme;
