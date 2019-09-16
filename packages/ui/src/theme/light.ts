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
    fg: primaryColor(Saturation.HIGH, 30),
    bg: primaryColor(Saturation.LOW, 90),
    hoverBg: primaryColor(Saturation.LOW, 95),
    activeBg: primaryColor(Saturation.HIGH, 85),
    disabledFg: primaryColor(Saturation.LOW, 80),
    disabledBg: primaryColor(Saturation.LOW, 95),
    altFg: '#FFFFFF',
    altBg: primaryColor(Saturation.HIGH, 40),
    hoverAltBg: primaryColor(Saturation.HIGH, 50),
    activeAltBg: primaryColor(Saturation.HIGH, 35),
    disabledAltFg: '#FFFFFF',
    disabledAltBg: primaryColor(Saturation.LOW, 80),
    borderColor: primaryColor(Saturation.HIGH, 40),
    disabledBorderColor: primaryColor(Saturation.LOW, 80),
  },

  secondary: {
    fg: '#000000',
    bg: secondaryColor(Saturation.LOW, 90),
    hoverBg: secondaryColor(Saturation.LOW, 95),
    activeBg: secondaryColor(Saturation.HIGH, 85),
    disabledFg: secondaryColor(Saturation.LOW, 70),
    disabledBg: secondaryColor(Saturation.LOW, 95),
    altFg: '#FFFFFF',
    altBg: secondaryColor(Saturation.HIGH, 15),
    hoverAltBg: secondaryColor(Saturation.HIGH, 30),
    activeAltBg: secondaryColor(Saturation.HIGH, 5),
    disabledAltFg: '#FFFFFF',
    disabledAltBg: secondaryColor(Saturation.LOW, 60),
    borderColor: secondaryColor(Saturation.HIGH, 15),
    disabledBorderColor: secondaryColor(Saturation.LOW, 60),
  },

  danger: {
    fg: dangerColor(Saturation.HIGH, 30),
    bg: dangerColor(Saturation.HIGH, 95),
    hoverBg: dangerColor(Saturation.HIGH, 97),
    activeBg: dangerColor(Saturation.HIGH, 90),
    disabledFg: dangerColor(Saturation.LOW, 85),
    disabledBg: dangerColor(Saturation.LOW, 95),
    altFg: '#FFFFFF',
    altBg: dangerColor(Saturation.HIGH, 45),
    hoverAltBg: dangerColor(Saturation.HIGH, 50),
    activeAltBg: dangerColor(Saturation.HIGH, 40),
    disabledAltFg: '#FFFFFF',
    disabledAltBg: dangerColor(Saturation.LOW, 80),
    borderColor: dangerColor(Saturation.HIGH, 45),
    disabledBorderColor: dangerColor(Saturation.LOW, 80),
  },

  general: {
    fg: '#000000',
    bg: '#FFFFFF',
    hoverBg: '#FFFFFF',
    activeBg: generalColor(Saturation.HIGH, 95),
    disabledFg: generalColor(Saturation.LOW, 60),
    disabledBg: generalColor(Saturation.LOW, 85),
    altFg: '#000000',
    altBg: generalColor(Saturation.HIGH, 85),
    hoverAltBg: generalColor(Saturation.HIGH, 93),
    activeAltBg: generalColor(Saturation.HIGH, 75),
    disabledAltFg: generalColor(Saturation.LOW, 60),
    disabledAltBg: generalColor(Saturation.LOW, 95),
    borderColor: generalColor(Saturation.HIGH, 75),
    disabledBorderColor: generalColor(Saturation.LOW, 90),
  },

  link: {
    color: 'hsl(215, 100%, 40%)',
    visited: 'hsl(275, 60%, 45%)',
    hover: 'hsl(215, 100%, 60%)',
    active: 'hsl(30, 100%, 45%)',
  },

  focus: {
    color: focusColor(Saturation.HIGH, 55),
    style: `
      box-shadow: 0 0 4px ${focusColor(Saturation.HIGH, 55)};
      outline: none;
    `,
  },

  selection: {
    bg: selectionColor(Saturation.HIGH, 95),
    altBg: selectionColor(Saturation.HIGH, 80),
    borderColor: selectionColor(Saturation.HIGH, 65),
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.175)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.175)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.175)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.175)',
  },
});

export default LightTheme;
