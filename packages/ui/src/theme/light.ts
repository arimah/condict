import {
  PrimaryHue,
  GeneralHue,
  DangerHue,
  FocusHue,
  SelectionHue,
} from './shared';
import DefaultTheme from './default';
import {Theme} from './types';

const LightTheme: Theme = {
  ...DefaultTheme,

  dark: false,

  primary: {
    fg: `hsl(${PrimaryHue}, 70%, 30%)`,
    bg: `hsl(${PrimaryHue}, 45%, 90%)`,
    hoverBg: `hsl(${PrimaryHue}, 45%, 95%)`,
    activeBg: `hsl(${PrimaryHue}, 70%, 85%)`,
    disabledFg: `hsl(${PrimaryHue}, 45%, 80%)`,
    disabledBg: `hsl(${PrimaryHue}, 45%, 95%)`,
    altFg: '#FFFFFF',
    altBg: `hsl(${PrimaryHue}, 70%, 40%)`,
    hoverAltBg: `hsl(${PrimaryHue}, 70%, 50%)`,
    activeAltBg: `hsl(${PrimaryHue}, 70%, 35%)`,
    disabledAltFg: '#FFFFFF',
    disabledAltBg: `hsl(${PrimaryHue}, 45%, 80%)`,
    borderColor: `hsl(${PrimaryHue}, 70%, 40%)`,
    disabledBorderColor: `hsl(${PrimaryHue}, 45%, 80%)`,
  },

  secondary: {
    fg: '#000000',
    bg: `hsl(${GeneralHue}, 10%, 85%)`,
    hoverBg: `hsl(${GeneralHue}, 10%, 90%)`,
    activeBg: `hsl(${GeneralHue}, 15%, 80%)`,
    disabledFg: `hsl(${GeneralHue}, 10%, 60%)`,
    disabledBg: `hsl(${GeneralHue}, 10%, 90%)`,
    altFg: '#FFFFFF',
    altBg: `hsl(${GeneralHue}, 15%, 15%)`,
    hoverAltBg: `hsl(${GeneralHue}, 15%, 30%)`,
    activeAltBg: `hsl(${GeneralHue}, 15%, 5%)`,
    disabledAltFg: '#FFFFFF',
    disabledAltBg: `hsl(${GeneralHue}, 10%, 60%)`,
    borderColor: `hsl(${GeneralHue}, 15%, 15%)`,
    disabledBorderColor: `hsl(${GeneralHue}, 10%, 60%)`,
  },

  danger: {
    fg: `hsl(${DangerHue}, 90%, 30%)`,
    bg: `hsl(${DangerHue}, 90%, 95%)`,
    hoverBg: `hsl(${DangerHue}, 90%, 97%)`,
    activeBg: `hsl(${DangerHue}, 90%, 90%)`,
    disabledFg: `hsl(${DangerHue}, 50%, 85%)`,
    disabledBg: `hsl(${DangerHue}, 50%, 95%)`,
    altFg: '#FFFFFF',
    altBg: `hsl(${DangerHue}, 90%, 45%)`,
    hoverAltBg: `hsl(${DangerHue}, 90%, 50%)`,
    activeAltBg: `hsl(${DangerHue}, 90%, 40%)`,
    disabledAltFg: '#FFFFFF',
    disabledAltBg: `hsl(${DangerHue}, 50%, 80%)`,
    borderColor: `hsl(${DangerHue}, 90%, 45%)`,
    disabledBorderColor: `hsl(${DangerHue}, 50%, 80%)`,
  },

  general: {
    fg: '#000000',
    bg: '#FFFFFF',
    hoverBg: '#FFFFFF',
    activeBg: `hsl(${GeneralHue}, 15%, 95%)`,
    disabledFg: `hsl(${GeneralHue}, 10%, 60%)`,
    disabledBg: `hsl(${GeneralHue}, 10%, 85%)`,
    altFg: '#000000',
    altBg: `hsl(${GeneralHue}, 15%, 85%)`,
    hoverAltBg: `hsl(${GeneralHue}, 15%, 93%)`,
    activeAltBg: `hsl(${GeneralHue}, 15%, 75%)`,
    disabledAltFg: `hsl(${GeneralHue}, 10%, 60%)`,
    disabledAltBg: `hsl(${GeneralHue}, 10%, 95%)`,
    borderColor: `hsl(${GeneralHue}, 15%, 75%)`,
    disabledBorderColor: `hsl(${GeneralHue}, 10%, 90%)`,
  },

  link: {
    color: 'hsl(215, 100%, 40%)',
    visited: 'hsl(275, 60%, 45%)',
    hover: 'hsl(215, 100%, 60%)',
    active: 'hsl(30, 100%, 45%)',
  },

  focus: {
    color: `hsl(${FocusHue}, 95%, 55%)`,
    style: `
      box-shadow: 0 0 4px hsl(${FocusHue}, 95%, 55%);
      outline: none;
    `,
  },

  selection: {
    bg: `hsl(${SelectionHue}, 95%, 95%)`,
    altBg: `hsl(${SelectionHue}, 95%, 80%)`,
    borderColor: `hsl(${SelectionHue}, 95%, 65%)`,
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.175)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.175)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.175)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.175)',
  },
};

export default LightTheme;
