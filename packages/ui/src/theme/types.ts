export interface Theme {
  /** Variables set by this theme. */
  readonly vars: ThemeVariables;

  /** Timing variables, for controlling animations and transitions. */
  readonly timing: TimingTheme;
}

/**
 * A mapping of variable name to variable value. These are exposed as CSS custom
 * properties for use by components. Variable names do *not* include the `--`
 * that custom properties all start with. Variable values are pure CSS values,
 * usually colors, sometimes shadows or border styles. Variable values that
 * refer to other variables use `var(--foo)` syntax *with* the leading `--`.
 *
 * The value `null` or `undefined` is the same as not setting the variable:
 * the generated CSS will not include the variable at all.
 *
 * Example:
 *
 *     {
 *       'fg': 'black',
 *       'bg': '#ffffff',
 *       'bg-hover': null,
 *       'border': '#ddd',
 *       'border-hover': 'var(--border)',
 *     }
 *
 * Generated CSS:
 *
 *     --fg: black;
 *     --bg: #ffffff;
 *     --border: #ddd;
 *     --border-hover: var(--border);
 */
export interface ThemeVariables {
  readonly [key: string]: string | null | undefined;
}

/** Settings that control the timing of transitions and animations. */
export interface TimingTheme {
  /** The user's motion preference. */
  readonly motion: MotionPreference;
  /**
   * Duration (in milliseconds) of a short transition or animation. This value
   * may be affected by the user's motion preference, and may be 0.
   */
  readonly short: number;
  /**
   * Duration (in milliseconds) of a long transition or animation. This value
   * may be affected by the user's motion preference, and may be 0.
   */
  readonly long: number;
}

/** A user's motion preference. */
export type MotionPreference = 'full' | 'reduced' | 'none';

/**
 * Colors for a single shade.
 *
 * Every shade defines a basic palette of 10 colors at different brightness
 * levels, as well as a small selection specialised colors.
 */
export interface Shade {
  /** The basic color palette for this shade. */
  readonly palette: Palette;
  /** A color suitable for use as a swatch for this shade. */
  readonly swatch: string;
  /** Special colors for disabled UI components. */
  readonly disabled: DisabledColors;
}

/**
 * Contains disabled colors of a particular shade, for buttons.  Buttons are
 * special as they are the only UI component that retains the accent/danger
 * color when disabled; all others turn grey.
 */
export interface DisabledColors {
  readonly lightButtonBg: string;
  readonly darkButtonBg: string;
}

/**
 * Contains a gradient of colors of the same hue and similar saturation, from
 * bright to dark.
 *
 * `_50` (index 0) is always the brightest color (closest to white), while
 * `_900` (index 9) is the darkest (closest to black).
 */
export type Palette = readonly [
  _50: string,
  _100: string,
  _200: string,
  _300: string,
  _400: string,
  _500: string,
  _600: string,
  _700: string,
  _800: string,
  _900: string,
];
