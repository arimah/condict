import {ThemeVariables} from './types';

/**
 * The values represent the pixel size of the regular font size.
 */
export type FontSizeOption = '13' | '14' | '15' | '16' | '18';

export type LineHeightOption = '1.25' | '1.5' | '1.75' | '2';

type FontSizeGroup = {
  readonly [key in FontSizeName]: readonly [
    fontSize: string,
    lineHeight: LineHeight,
  ];
};

type LineHeight = string | VariableLineHeight;

type VariableLineHeight = {
  readonly [key in LineHeightOption]: string;
};

type FontSizeName =
  // The smallest font size, used only for things that need to be severely
  // de-emphasised, such as slider tick values.
  | 'xs'
  // Slightly smaller text, used mainly for subscript and superscript text.
  | 'sm'
  // Regular font size.
  | 'md'
  // Regular font size with increased line height, for body text.
  | 'mb'
  // A larger size, for things that are slightly larger than regular but
  // not strongly emphasised, mainly <h4>-sized content.
  | 'lg'
  // A noticeably larger font size, for content in between <h4> and <h3>, such
  // as card titles.
  | 'xl'
  // An extra large font size, for <h3>-sized content.
  | 'xxl'
  // An extra extra large font size, for <h2>-sized content.
  | 'xxxl'
  // The biggest font size, for <h1>-sized content (and nothing else).
  | 'huge';

// Line height scales non-linearly for heading-sized text, as headings have
// large margins and typically only short snippets of text. The values here
// are chosen manually, to ensure good spacing within the UI.
//
// Beyond font size 18, we would need to start adjusting paddings, margins,
// icon sizes and other dimensions in the UI to keep things looking decent.
// At that point it's better just to zoom in.

const FontSizes: Record<FontSizeOption, FontSizeGroup> = {
  '13': {
    xs: ['11px', '12px'],
    sm: ['11px', '12px'],
    md: ['13px', '16px'],
    mb: ['13px', {'1.25': '16px', '1.5': '18px', '1.75': '22px', '2': '26px'}],
    lg: ['15px', {'1.25': '18px', '1.5': '18px', '1.75': '22px', '2': '26px'}],
    xl: ['17px', {'1.25': '20px', '1.5': '20px', '1.75': '22px', '2': '26px'}],
    xxl: ['19px', {'1.25': '20px', '1.5': '22px', '1.75': '24px', '2': '26px'}],
    xxxl: ['23px', {'1.25': '26px', '1.5': '26px', '1.75': '28px', '2': '30px'}],
    huge: ['28px', '32px'],
  },
  '14': {
    xs: ['11px', '12px'],
    sm: ['12px', '13px'],
    md: ['14px', '18px'],
    mb: ['14px', {'1.25': '18px', '1.5': '20px', '1.75': '24px', '2': '28px'}],
    lg: ['16px', {'1.25': '18px', '1.5': '20px', '1.75': '24px', '2': '28px'}],
    xl: ['18px', {'1.25': '20px', '1.5': '22px', '1.75': '24px', '2': '28px'}],
    xxl: ['20px', {'1.25': '22px', '1.5': '22px', '1.75': '24px', '2': '28px'}],
    xxxl: ['24px', {'1.25': '26px', '1.5': '26px', '1.75': '28px', '2': '30px'}],
    huge: ['28px', '32px'],
  },
  '15': {
    xs: ['12px', '13px'],
    sm: ['13px', '15px'],
    md: ['15px', '20px'],
    mb: ['15px', {'1.25': '20px', '1.5': '22px', '1.75': '26px', '2': '30px'}],
    lg: ['17px', {'1.25': '20px', '1.5': '22px', '1.75': '26px', '2': '30px'}],
    xl: ['20px', {'1.25': '22px', '1.5': '24px', '1.75': '26px', '2': '30px'}],
    xxl: ['24px', {'1.25': '26px', '1.5': '26px', '1.75': '28px', '2': '30px'}],
    xxxl: ['26px', {'1.25': '28px', '1.5': '28px', '1.75': '30px', '2': '32px'}],
    huge: ['30px', '34px'],
  },
  '16': {
    xs: ['13px', '14px'],
    sm: ['14px', '16px'],
    md: ['16px', '22px'],
    mb: ['16px', {'1.25': '22px', '1.5': '24px', '1.75': '28px', '2': '32px'}],
    lg: ['19px', {'1.25': '22px', '1.5': '24px', '1.75': '28px', '2': '32px'}],
    xl: ['22px', {'1.25': '24px', '1.5': '26px', '1.75': '28px', '2': '32px'}],
    xxl: ['26px', {'1.25': '28px', '1.5': '28px', '1.75': '30px', '2': '32px'}],
    xxxl: ['28px', {'1.25': '30px', '1.5': '30px', '1.75': '32px', '2': '34px'}],
    huge: ['32px', '36px'],
  },
  '18': {
    xs: ['14px', '16px'],
    sm: ['16px', '18px'],
    md: ['18px', '24px'],
    mb: ['18px', {'1.25': '24px', '1.5': '26px', '1.75': '32px', '2': '36px'}],
    lg: ['21px', {'1.25': '24px', '1.5': '26px', '1.75': '32px', '2': '36px'}],
    xl: ['23px', {'1.25': '26px', '1.5': '28px', '1.75': '32px', '2': '36px'}],
    xxl: ['26px', {'1.25': '28px', '1.5': '30px', '1.75': '32px', '2': '36px'}],
    xxxl: ['30px', {'1.25': '32px', '1.5': '34px', '1.75': '36px', '2': '36px'}],
    huge: ['34px', '38px'],
  },
};

export const fontSizeVars = (
  fontSize: FontSizeOption,
  lineHeight: LineHeightOption
): ThemeVariables => {
  type MutableThemeVariables = {
    [K in keyof ThemeVariables]: ThemeVariables[K];
  };

  const sizes = FontSizes[fontSize];

  const vars: MutableThemeVariables = {};
  for (const [k, v] of Object.entries(sizes)) {
    vars[`font-size-${k}`] = v[0];
    vars[`line-height-${k}`] =
      typeof v[1] !== 'string'
        ? v[1][lineHeight]
        : v[1];
  }
  return vars;
};
