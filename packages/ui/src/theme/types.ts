import Intent from '../intent';

export interface Theme {
  /** The theme mode (dark or light). */
  readonly mode: ThemeMode;

  /**
   * Generic default foreground color. Paired with defaultBg, defaultHoverBg,
   * defaultActiveBg.
   */
  readonly defaultFg: string;
  /** Generic default background color. Paired with defaultFg. */
  readonly defaultBg: string;
  /** Generic default hover background color. Paired with defaultFg. */
  readonly defaultHoverBg: string;
  /** Generic default active background color. Paired with defaultFg. */
  readonly defaultActiveBg: string;

  /** General greyish color group. */
  readonly general: UIColors;
  /** Main accent color group, signifying primary actions and other accents. */
  readonly accent: UIColors;
  /** Danger color group, signifying dangerous actions. */
  readonly danger: UIColors;

  /** Link colors. */
  readonly link: LinkColors;

  /** Styles for focus rectangles and other focus markers. */
  readonly focus: FocusTheme;

  /** Shadow styles. */
  readonly shadow: ShadowTheme;

  /** Timing variables, for controlling animations and transitions. */
  readonly timing: TimingTheme;
}

/** The default brightness of a theme (light or dark). */
export type ThemeMode = 'light' | 'dark';

/**
 * A color group, containing colors of a common hue that are intended to be used
 * together for different parts of the UI.
 *
 * The `defaultFg` color provides an accent to text or icons on the theme's
 * `defaultBg`. The `fg` color is used together with `bg`; usually the `fg` color
 * is less saturated than `defaultFg`, to ensure a good contrast against `bg`.
 */
export interface UIColors {
  /** General foreground color when used on theme.defaultBg. */
  readonly defaultFg: string;

  // Regular/subtle.

  /** General foreground color when used on bg, hoverBg and activeBg. */
  readonly fg: string;
  /** General background color. Paired with fg. */
  readonly bg: string;
  /** Hover background color. Paired with fg. */
  readonly hoverBg: string;
  /** Active/pressed background color. Paired with fg. */
  readonly activeBg: string;
  /** Disabled foreground color. Paired with disabledBg. */
  readonly disabledFg: string;
  /** Disabled background color. Paired with disabledFg. */
  readonly disabledBg: string;

  /** Bold foreground color. Paired with boldBg, boldHoverBg and boldActiveBg. */
  readonly boldFg: string;
  /** Bold background color. Paired with boldFg. */
  readonly boldBg: string;
  /** Bold hover background color. Paired with boldFg. */
  readonly boldHoverBg: string;
  /** Bold active/pressed background color. Paired with boldFg. */
  readonly boldActiveBg: string;
  /** Bold disabled foreground color. Paired with boldDisabledBg. */
  readonly boldDisabledFg: string;
  /** Bold disabled background color. Paired with boldDisabledFg. */
  readonly boldDisabledBg: string;

  /**
   * General border color. Paired with theme.defaultBg or the color group's bg.
   */
  readonly border: string;
  /**
   * Disabled border color. Paired with theme.defaultBg or the color group's
   * disabledBg.
   */
  readonly disabledBorder: string;
}

/** Colors for links, both internal and external. */
export interface LinkColors {
  /** General link foreground color. */
  readonly link: string;
  /** Visited link foreground color. */
  readonly visited: string;
  /** Hover foreground color. */
  readonly hover: string;
  /** Active/pressed foreground color. */
  readonly active: string;
}

/** Colors and styles for focus rectangles and other focus markers. */
export interface FocusTheme {
  /**
   * Focus rectangle color. Should be used for borders, occasionally shadows,
   * and not much else.
   */
  readonly color: string;
  /**
   * A CSS value for a focus box shadow, for giving focused elements a bit of
   * extra glow.
   */
  readonly shadow: string;
}

/** Styles and colors for drop shadows. */
export interface ShadowTheme {
  /**
   * A semi-transparent black color suitable for drop shadows. This is a more
   * opaque black color on dark themes, to make it more visible.
   */
  readonly color: string;
  /** A CSS value for a drop shadow of low elevation. */
  readonly elevation1: string;
  /** A CSS value for a drop shadow of medium elevation. */
  readonly elevation2: string;
  /** A CSS value for a drop shadow of high elevation. */
  readonly elevation3: string;
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
 * A color group for a single shade. Every shade come in `bold` (saturated) and
 * `pale` (unsaturated) variants. The `ui` property contains an appropriate
 * UIColors mapping for the shade.
 */
export interface ShadeGroup {
  /** The bold (saturated) variant. */
  readonly bold: ColorRange;
  /** The pale (desaturated) variant. */
  readonly pale: ColorRange;
  /** A light theme UI color mapping. */
  readonly light: UIColors;
  /** A dark theme UI color mapping. */
  readonly dark: UIColors;
}

export type ColorRange = {
  /**
   * A color value for a specific brightness. 0 is the brightest (closest to
   * white), while 7 is the darkest (closest to black). These mappings are *not*
   * affected by the theme (0 is always brightest).
   */
  readonly [K in 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7]: string;
};

export interface IntentProps {
  readonly intent: Intent;
  readonly theme: Theme;
}
