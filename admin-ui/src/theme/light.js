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
    activeBg: primaryColor(Saturation.high, 85),
    disabledFg: primaryColor(Saturation.low, 80),
    disabledBg: primaryColor(Saturation.low, 95),
    altFg: '#FFFFFF',
    altBg: primaryColor(Saturation.high, 40),
    activeAltBg: primaryColor(Saturation.high, 35),
    disabledAltFg: '#FFFFFF',
    disabledAltBg: primaryColor(Saturation.low, 80),
    borderColor: primaryColor(Saturation.high, 40),
    disabledBorderColor: primaryColor(Saturation.low, 80),
  },

  secondary: {
    fg: '#000000',
    bg: secondaryColor(Saturation.low, 90),
    activeBg: secondaryColor(Saturation.high, 85),
    disabledFg: secondaryColor(Saturation.low, 70),
    disabledBg: secondaryColor(Saturation.low, 95),
    altFg: '#FFFFFF',
    altBg: secondaryColor(Saturation.high, 15),
    activeAltBg: secondaryColor(Saturation.high, 5),
    disabledAltFg: '#FFFFFF', // 200
    disabledAltBg: secondaryColor(Saturation.low, 60),
    borderColor: secondaryColor(Saturation.high, 15),
    disabledBorderColor: secondaryColor(Saturation.low, 60),
  },

  danger: {
    fg: dangerColor(Saturation.high, 40),
    bg: dangerColor(Saturation.high, 95),
    activeBg: dangerColor(Saturation.high, 90),
    disabledFg: dangerColor(Saturation.low, 85),
    disabledBg: dangerColor(Saturation.low, 95),
    altFg: '#FFFFFF',
    altBg: dangerColor(Saturation.high, 45),
    activeAltBg: dangerColor(Saturation.high, 40),
    disabledAltFg: '#FFFFFF',
    disabledAltBg: dangerColor(Saturation.low, 80),
    borderColor: dangerColor(Saturation.high, 45),
    disabledBorderColor: dangerColor(Saturation.low, 80),
  },

  general: {
    fg: '#000000',
    bg: '#FFFFFF',
    activeBg: generalColor(Saturation.high, 95),
    disabledFg: generalColor(Saturation.low, 60),
    disabledBg: generalColor(Saturation.low, 85),
    altFg: '#000000',
    altBg: generalColor(Saturation.high, 85),
    activeAltBg: generalColor(Saturation.high, 80),
    disabledAltFg: generalColor(Saturation.low, 60),
    disabledAltBg: generalColor(Saturation.low, 95),
    borderColor: generalColor(Saturation.high, 75),
    disabledBorderColor: generalColor(Saturation.low, 90),
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
});

export default LightTheme;
