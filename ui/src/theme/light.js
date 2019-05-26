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

const LightTheme = createTheme({
  dark: false,

  primary: {
    fg: primaryColor(Saturation.high, 35),
    bg: primaryColor(Saturation.low, 90),
    hoverBg: primaryColor(Saturation.low, 95),
    activeBg: primaryColor(Saturation.high, 85),
    disabledFg: primaryColor(Saturation.low, 80),
    disabledBg: primaryColor(Saturation.low, 95),
    altFg: '#FFFFFF',
    altBg: primaryColor(Saturation.high, 40),
    hoverAltBg: primaryColor(Saturation.high, 50),
    activeAltBg: primaryColor(Saturation.high, 35),
    disabledAltFg: '#FFFFFF',
    disabledAltBg: primaryColor(Saturation.low, 80),
    borderColor: primaryColor(Saturation.high, 40),
    disabledBorderColor: primaryColor(Saturation.low, 80),
  },

  secondary: {
    fg: '#000000',
    bg: secondaryColor(Saturation.low, 90),
    hoverBg: secondaryColor(Saturation.low, 95),
    activeBg: secondaryColor(Saturation.high, 85),
    disabledFg: secondaryColor(Saturation.low, 70),
    disabledBg: secondaryColor(Saturation.low, 95),
    altFg: '#FFFFFF',
    altBg: secondaryColor(Saturation.high, 15),
    hoverAltBg: secondaryColor(Saturation.high, 30),
    activeAltBg: secondaryColor(Saturation.high, 5),
    disabledAltFg: '#FFFFFF',
    disabledAltBg: secondaryColor(Saturation.low, 60),
    borderColor: secondaryColor(Saturation.high, 15),
    disabledBorderColor: secondaryColor(Saturation.low, 60),
  },

  danger: {
    fg: dangerColor(Saturation.high, 40),
    bg: dangerColor(Saturation.high, 95),
    hoverBg: dangerColor(Saturation.high, 97),
    activeBg: dangerColor(Saturation.high, 90),
    disabledFg: dangerColor(Saturation.low, 85),
    disabledBg: dangerColor(Saturation.low, 95),
    altFg: '#FFFFFF',
    altBg: dangerColor(Saturation.high, 45),
    hoverAltBg: dangerColor(Saturation.high, 50),
    activeAltBg: dangerColor(Saturation.high, 40),
    disabledAltFg: '#FFFFFF',
    disabledAltBg: dangerColor(Saturation.low, 80),
    borderColor: dangerColor(Saturation.high, 45),
    disabledBorderColor: dangerColor(Saturation.low, 80),
  },

  general: {
    fg: '#000000',
    bg: '#FFFFFF',
    hoverBg: '#FFFFFF',
    activeBg: generalColor(Saturation.high, 95),
    disabledFg: generalColor(Saturation.low, 60),
    disabledBg: generalColor(Saturation.low, 85),
    altFg: '#000000',
    altBg: generalColor(Saturation.high, 85),
    hoverAltBg: generalColor(Saturation.high, 93),
    activeAltBg: generalColor(Saturation.high, 75),
    disabledAltFg: generalColor(Saturation.low, 60),
    disabledAltBg: generalColor(Saturation.low, 95),
    borderColor: generalColor(Saturation.high, 75),
    disabledBorderColor: generalColor(Saturation.low, 90),
  },

  link: {
    color: 'hsl(215, 100%, 40%)',
    visited: 'hsl(275, 60%, 45%)',
    hover: 'hsl(215, 100%, 60%)',
    active: 'hsl(30, 100%, 45%)',
  },

  focus: {
    color: focusColor(Saturation.high, 55),
    style: css`
      box-shadow: 0 0 4px ${focusColor(Saturation.high, 55)};
      outline: none;
    `,
  },

  selection: {
    bg: selectionColor(Saturation.high, 95),
    altBg: selectionColor(Saturation.high, 80),
    borderColor: selectionColor(Saturation.high, 65),
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.175)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.175)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.175)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.175)',
  },
});

export default LightTheme;