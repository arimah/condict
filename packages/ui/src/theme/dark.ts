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
    fg: primaryColor(Saturation.HIGH, 90),
    bg: primaryColor(Saturation.LOW, 20),
    hoverBg: primaryColor(Saturation.LOW, 25),
    activeBg: primaryColor(Saturation.HIGH, 15),
    disabledFg: primaryColor(Saturation.LOW, 35),
    disabledBg: primaryColor(Saturation.LOW, 15),
    altFg: '#000000',
    altBg: primaryColor(Saturation.HIGH, 65),
    hoverAltBg: primaryColor(Saturation.HIGH, 75),
    activeAltBg: primaryColor(Saturation.HIGH, 60),
    disabledAltFg: '#000000',
    disabledAltBg: primaryColor(Saturation.LOW, 30),
    borderColor: primaryColor(Saturation.HIGH, 65),
    disabledBorderColor: primaryColor(Saturation.LOW, 30),
  },

  secondary: {
    fg: '#FFFFFF',
    bg: secondaryColor(Saturation.LOW, 20),
    hoverBg: secondaryColor(Saturation.LOW, 25),
    activeBg: secondaryColor(Saturation.HIGH, 15),
    disabledFg: secondaryColor(Saturation.LOW, 40),
    disabledBg: secondaryColor(Saturation.LOW, 15),
    altFg: '#000000',
    altBg: secondaryColor(Saturation.HIGH, 85),
    hoverAltBg: secondaryColor(Saturation.HIGH, 95),
    activeAltBg: secondaryColor(Saturation.HIGH, 80),
    disabledAltFg: '#000000',
    disabledAltBg: secondaryColor(Saturation.LOW, 30),
    borderColor: secondaryColor(Saturation.HIGH, 85),
    disabledBorderColor: secondaryColor(Saturation.LOW, 30),
  },

  danger: {
    fg: dangerColor(Saturation.HIGH, 90),
    bg: dangerColor(Saturation.LOW, 20),
    hoverBg: dangerColor(Saturation.LOW, 25),
    activeBg: dangerColor(Saturation.HIGH, 10),
    disabledFg: dangerColor(Saturation.LOW, 40),
    disabledBg: dangerColor(Saturation.LOW, 15),
    altFg: '#000000',
    altBg: dangerColor(Saturation.HIGH, 65),
    hoverAltBg: dangerColor(Saturation.HIGH, 75),
    activeAltBg: dangerColor(Saturation.HIGH, 60),
    disabledAltFg: '#000000',
    disabledAltBg: dangerColor(Saturation.LOW, 20),
    borderColor: dangerColor(Saturation.HIGH, 65),
    disabledBorderColor: dangerColor(Saturation.LOW, 20),
  },

  general: {
    fg: '#FFFFFF',
    bg: generalColor(Saturation.LOW, 10),
    hoverBg: generalColor(Saturation.LOW, 15),
    activeBg: generalColor(Saturation.HIGH, 5),
    disabledFg: generalColor(Saturation.LOW, 40),
    disabledBg: generalColor(Saturation.LOW, 20),
    altFg: '#FFFFFF',
    altBg: generalColor(Saturation.HIGH, 25),
    hoverAltBg: generalColor(Saturation.HIGH, 35),
    activeAltBg: generalColor(Saturation.HIGH, 15),
    disabledAltFg: generalColor(Saturation.LOW, 50),
    disabledAltBg: generalColor(Saturation.LOW, 15),
    borderColor: generalColor(Saturation.HIGH, 35),
    disabledBorderColor: generalColor(Saturation.LOW, 20),
  },

  link: {
    color: 'hsl(215, 100%, 75%)',
    visited: 'hsl(275, 60%, 70%)',
    hover: 'hsl(215, 100%, 85%)',
    active: 'hsl(30, 100%, 70%)',
  },

  focus: {
    color: focusColor(Saturation.HIGH, 55),
    style: `
      box-shadow: 0 0 4px ${focusColor(Saturation.HIGH, 55)};
      outline: none;
    `,
  },

  selection: {
    bg: selectionColor(Saturation.HIGH, 20),
    altBg: selectionColor(Saturation.HIGH, 35),
    borderColor: selectionColor(Saturation.HIGH, 45),
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.35)',
    elevation1: '0 2px 5px rgba(0, 0, 0, 0.35)',
    elevation2: '0 3px 8px rgba(0, 0, 0, 0.35)',
    elevation3: '0 4px 10px rgba(0, 0, 0, 0.35)',
  },
});

export default DarkTheme;
