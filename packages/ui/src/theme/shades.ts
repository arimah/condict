import {ShadeGroup, ColorRange} from './types';

const makeShade = (bold: ColorRange, pale: ColorRange): ShadeGroup => ({
  bold,
  pale,
  light: {
    defaultFg: bold[6],
    fg: '#000000',
    bg: bold[1],
    hoverBg: bold[0],
    activeBg: bold[2],
    disabledFg: pale[4],
    disabledBg: pale[0],
    boldFg: '#ffffff',
    boldBg: bold[5],
    boldHoverBg: bold[4],
    boldActiveBg: bold[6],
    boldDisabledFg: pale[0],
    boldDisabledBg: pale[2],
    border: bold[2],
    disabledBorder: pale[1],
  },
  dark: {
    defaultFg: bold[1],
    fg: '#ffffff',
    bg: bold[6],
    hoverBg: bold[5],
    activeBg: bold[7],
    disabledFg: pale[2],
    disabledBg: pale[7],
    boldFg: '#000000',
    boldBg: bold[2],
    boldHoverBg: bold[1],
    boldActiveBg: bold[3],
    boldDisabledFg: pale[7],
    boldDisabledBg: pale[5],
    border: bold[4],
    disabledBorder: pale[6],
  },
});

export const Red = makeShade(
  ['#fdf2f3', '#f9d7da', '#f5b8bd', '#ed828b', '#e64c59', '#cd1d2c', '#8a141e', '#590d13'],
  ['#faf5f5', '#eedddf', '#e0c2c5', '#c9979b', '#ae6167', '#8a474d', '#5b2f32', '#3d1f22']
);


export const Yellow = makeShade(
  ['#f9f0d8', '#f2e1b0', '#e6c465', '#cea022', '#af881d', '#886a16', '#58440e', '#42330b'],
  ['#f5f2eb', '#e3dcc9', '#cdc09d', '#b19d68', '#917e4b', '#6c5e37', '#4a4026', '#2f2918']
);


export const Green = makeShade(
  ['#e6fae7', '#b3efb8', '#74e27d', '#35d442', '#25ad30', '#1d8725', '#145d1a', '#0c3b10'],
  ['#ecf4ec', '#cce1cd', '#a2c8a5', '#6eaa73', '#538d58', '#406d44', '#2d4d30', '#203722']
);


export const Blue = makeShade(
  ['#edf3fd', '#d1e2fa', '#a8c8f5', '#6ca3ef', '#2c7ae8', '#155dc1', '#0f4085', '#0a2a57'],
  ['#f2f4f8', '#d8dfe9', '#bbc7d8', '#91a4c0', '#6782a8', '#4c6485', '#324257', '#232e3e']
);


export const Purple = makeShade(
  ['#fbf2fd', '#f4d7f9', '#e7abf2', '#da7bea', '#cb46e2', '#ad1fc7', '#771589', '#4d0e58'],
  ['#f7f2f8', '#e9dbeb', '#d6bddb', '#ba8fc1', '#a46bae', '#844e8d', '#5f3866', '#3d2442']
);

export const Gray = makeShade(
  ['#f0f2f4', '#d6d9e1', '#acb4c3', '#808ca3', '#606d85', '#4b5468', '#363c4a', '#292e38'],
  ['#f1f2f3', '#d8dadf', '#b1b5be', '#878e9b', '#6b7280', '#515761', '#3a3e45', '#2a2d32']
);

/** Greenish blue. */
export const FocusHue = 200;
