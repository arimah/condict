import {
  PrimaryHue,
  GeneralHue,
  DangerHue,
  FocusHue,
  SelectionHue,
} from './shared';
import DefaultTheme from './default';
import {Theme} from './types';

const DarkTheme: Theme = {
  ...DefaultTheme,

  dark: true,

  primary: {
    fg: `hsl(${PrimaryHue}, 70%, 90%)`,
    bg: `hsl(${PrimaryHue}, 45%, 20%)`,
    hoverBg: `hsl(${PrimaryHue}, 45%, 25%)`,
    activeBg: `hsl(${PrimaryHue}, 70%, 15%)`,
    disabledFg: `hsl(${PrimaryHue}, 45%, 35%)`,
    disabledBg: `hsl(${PrimaryHue}, 45%, 15%)`,
    altFg: '#000000',
    altBg: `hsl(${PrimaryHue}, 70%, 65%)`,
    hoverAltBg: `hsl(${PrimaryHue}, 70%, 75%)`,
    activeAltBg: `hsl(${PrimaryHue}, 70%, 60%)`,
    disabledAltFg: '#000000',
    disabledAltBg: `hsl(${PrimaryHue}, 45%, 30%)`,
    borderColor: `hsl(${PrimaryHue}, 70%, 65%)`,
    disabledBorderColor: `hsl(${PrimaryHue}, 45%, 30%)`,
  },

  secondary: {
    fg: '#FFFFFF',
    bg: `hsl(${GeneralHue}, 10%, 20%)`,
    hoverBg: `hsl(${GeneralHue}, 10%, 25%)`,
    activeBg: `hsl(${GeneralHue}, 15%, 15%)`,
    disabledFg: `hsl(${GeneralHue}, 10%, 40%)`,
    disabledBg: `hsl(${GeneralHue}, 10%, 15%)`,
    altFg: '#000000',
    altBg: `hsl(${GeneralHue}, 15%, 85%)`,
    hoverAltBg: `hsl(${GeneralHue}, 15%, 95%)`,
    activeAltBg: `hsl(${GeneralHue}, 15%, 80%)`,
    disabledAltFg: '#000000',
    disabledAltBg: `hsl(${GeneralHue}, 10%, 30%)`,
    borderColor: `hsl(${GeneralHue}, 15%, 85%)`,
    disabledBorderColor: `hsl(${GeneralHue}, 10%, 30%)`,
  },

  danger: {
    fg: `hsl(${DangerHue}, 90%, 90%)`,
    bg: `hsl(${DangerHue}, 50%, 20%)`,
    hoverBg: `hsl(${DangerHue}, 50%, 25%)`,
    activeBg: `hsl(${DangerHue}, 90%, 10%)`,
    disabledFg: `hsl(${DangerHue}, 50%, 40%)`,
    disabledBg: `hsl(${DangerHue}, 50%, 15%)`,
    altFg: '#000000',
    altBg: `hsl(${DangerHue}, 90%, 65%)`,
    hoverAltBg: `hsl(${DangerHue}, 90%, 75%)`,
    activeAltBg: `hsl(${DangerHue}, 90%, 60%)`,
    disabledAltFg: '#000000',
    disabledAltBg: `hsl(${DangerHue}, 50%, 20%)`,
    borderColor: `hsl(${DangerHue}, 90%, 65%)`,
    disabledBorderColor: `hsl(${DangerHue}, 50%, 20%)`,
  },

  general: {
    fg: '#FFFFFF',
    bg: `hsl(${GeneralHue}, 10%, 10%)`,
    hoverBg: `hsl(${GeneralHue}, 10%, 15%)`,
    activeBg: `hsl(${GeneralHue}, 15%, 5%)`,
    disabledFg: `hsl(${GeneralHue}, 10%, 40%)`,
    disabledBg: `hsl(${GeneralHue}, 10%, 20%)`,
    altFg: '#FFFFFF',
    altBg: `hsl(${GeneralHue}, 15%, 25%)`,
    hoverAltBg: `hsl(${GeneralHue}, 15%, 35%)`,
    activeAltBg: `hsl(${GeneralHue}, 15%, 15%)`,
    disabledAltFg: `hsl(${GeneralHue}, 10%, 50%)`,
    disabledAltBg: `hsl(${GeneralHue}, 10%, 15%)`,
    borderColor: `hsl(${GeneralHue}, 15%, 35%)`,
    disabledBorderColor: `hsl(${GeneralHue}, 10%, 20%)`,
  },

  link: {
    color: 'hsl(215, 100%, 75%)',
    visited: 'hsl(275, 60%, 70%)',
    hover: 'hsl(215, 100%, 85%)',
    active: 'hsl(30, 100%, 70%)',
  },

  focus: {
    color: `hsl(${FocusHue}, 95%, 55%)`,
    style: `
      box-shadow: 0 0 4px hsl(${FocusHue}, 95%, 55%);
      outline: none;
    `,
  },

  selection: {
    bg: `hsl(${SelectionHue}, 95%, 20%)`,
    altBg: `hsl(${SelectionHue}, 95%, 35%)`,
    borderColor: `hsl(${SelectionHue}, 95%, 45%)`,
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.35)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.35)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.35)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.35)',
  },
};

export default DarkTheme;
