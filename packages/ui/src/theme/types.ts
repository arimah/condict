import Intent from '../intent';

export interface Theme {
  readonly dark: boolean;
  readonly primary: IntentTheme;
  readonly secondary: IntentTheme;
  readonly danger: IntentTheme;
  readonly general: IntentTheme;
  readonly link: LinkTheme;
  readonly focus: FocusTheme;
  readonly selection: SelectionTheme;
  readonly timing: TimingTheme;
  readonly shadow: ShadowTheme;
}

export interface IntentTheme {
  readonly fg: string;
  readonly bg: string;
  readonly hoverBg: string;
  readonly activeBg: string;
  readonly disabledFg: string;
  readonly disabledBg: string;
  readonly altFg: string;
  readonly altBg: string;
  readonly hoverAltBg: string;
  readonly activeAltBg: string;
  readonly disabledAltFg: string;
  readonly disabledAltBg: string;
  readonly borderColor: string;
  readonly disabledBorderColor: string;
}

export interface LinkTheme {
  readonly color: string;
  readonly visited: string;
  readonly hover: string;
  readonly active: string;
}

export interface FocusTheme {
  readonly color: string;
  readonly style: string;
}

export interface SelectionTheme {
  readonly bg: string;
  readonly altBg: string;
  readonly borderColor: string;
}

export interface TimingTheme {
  readonly short: number;
  readonly long: number;
}

export interface ShadowTheme {
  readonly color: string;
  readonly elevation1: string;
  readonly elevation2: string;
  readonly elevation3: string;
}

export type IntentProps = {
  readonly intent: Intent;
  readonly theme: Theme;
};
