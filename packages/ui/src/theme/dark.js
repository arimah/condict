import {css} from 'styled-components';

import {createTheme} from './';
import {
  primaryColor,
  secondaryColor,
  dangerColor,
  generalColor,
  focusColor,
  selectionColor,
  Saturation,
} from './shared';

const DarkTheme = createTheme({
  dark: true,

  primary: {
    fg: primaryColor(Saturation.high, 65),
    bg: primaryColor(Saturation.low, 20),
    hoverBg: primaryColor(Saturation.low, 25),
    activeBg: primaryColor(Saturation.high, 15),
    disabledFg: primaryColor(Saturation.low, 35),
    disabledBg: primaryColor(Saturation.low, 15),
    altFg: '#000000',
    altBg: primaryColor(Saturation.high, 65),
    hoverAltBg: primaryColor(Saturation.high, 75),
    activeAltBg: primaryColor(Saturation.high, 60),
    disabledAltFg: '#000000',
    disabledAltBg: primaryColor(Saturation.low, 30),
    borderColor: primaryColor(Saturation.high, 65),
    disabledBorderColor: primaryColor(Saturation.low, 30),
  },

  secondary: {
    fg: '#FFFFFF',
    bg: secondaryColor(Saturation.low, 15),
    hoverBg: secondaryColor(Saturation.low, 20),
    activeBg: secondaryColor(Saturation.high, 10),
    disabledFg: secondaryColor(Saturation.low, 40),
    disabledBg: secondaryColor(Saturation.low, 10),
    altFg: '#000000',
    altBg: secondaryColor(Saturation.high, 85),
    hoverAltBg: secondaryColor(Saturation.high, 95),
    activeAltBg: secondaryColor(Saturation.high, 80),
    disabledAltFg: '#000000',
    disabledAltBg: secondaryColor(Saturation.low, 30),
    borderColor: secondaryColor(Saturation.high, 85),
    disabledBorderColor: secondaryColor(Saturation.low, 30),
  },

  danger: {
    fg: dangerColor(Saturation.high, 65),
    bg: dangerColor(Saturation.low, 20),
    hoverBg: dangerColor(Saturation.low, 25),
    activeBg: dangerColor(Saturation.high, 10),
    disabledFg: dangerColor(Saturation.low, 30),
    disabledBg: dangerColor(Saturation.low, 15),
    altFg: '#000000',
    altBg: dangerColor(Saturation.high, 65),
    hoverAltBg: dangerColor(Saturation.high, 75),
    activeAltBg: dangerColor(Saturation.high, 60),
    disabledAltFg: '#000000',
    disabledAltBg: dangerColor(Saturation.low, 20),
    borderColor: dangerColor(Saturation.high, 65),
    disabledBorderColor: dangerColor(Saturation.low, 20),
  },

  general: {
    fg: '#FFFFFF',
    bg: generalColor(Saturation.low, 10),
    hoverBg: generalColor(Saturation.low, 15),
    activeBg: generalColor(Saturation.high, 5),
    disabledFg: generalColor(Saturation.low, 40),
    disabledBg: generalColor(Saturation.low, 20),
    altFg: '#FFFFFF',
    altBg: generalColor(Saturation.high, 25),
    hoverAltBg: generalColor(Saturation.high, 35),
    activeAltBg: generalColor(Saturation.high, 15),
    disabledAltFg: generalColor(Saturation.low, 50),
    disabledAltBg: generalColor(Saturation.low, 15),
    borderColor: generalColor(Saturation.high, 35),
    disabledBorderColor: generalColor(Saturation.low, 20),
  },

  link: {
    color: 'hsl(215, 100%, 75%)',
    visited: 'hsl(275, 60%, 70%)',
    hover: 'hsl(215, 100%, 85%)',
    active: 'hsl(30, 100%, 70%)',
  },

  focus: {
    color: focusColor(Saturation.high, 55),
    style: css`
      box-shadow: 0 0 4px ${focusColor(Saturation.high, 55)};
      outline: none;
    `,
  },

  selection: {
    bg: selectionColor(Saturation.high, 20),
    altBg: selectionColor(Saturation.high, 35),
    borderColor: selectionColor(Saturation.high, 45),
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.35)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.35)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.35)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.35)',
  },
});

export default DarkTheme;
