import {Interpolation, css} from 'styled-components';

import {IntentTheme, TimingTheme, IntentProps} from './types';

/** Purple. */
export const PrimaryHue = 291;
/**
 * Blue with a tiny bit of green (greenish blue when saturated, or bluish grey
 * when desaturated).
 */
export const GeneralHue = 200;
/** Red with the tiniest hint of green. */
export const DangerHue = 1;
/** Greenish blue. */
export const FocusHue = 200;
/** Greenish blue, with less green. */
export const SelectionHue = 205;

export const intentVar =
  <K extends keyof IntentTheme>(variable: K) =>
    (props: IntentProps): IntentTheme[K] =>
      props.theme[props.intent][variable];

export const transition = (
  property: string,
  duration: number | keyof TimingTheme = 'short',
  timingFunc = 'ease-in-out'
): Interpolation<any> => css`
  transition-property: ${property};
  transition-duration: ${
    typeof duration === 'number'
      ? duration
      : (p => p.theme.timing[duration])
  }ms;
  transition-timing-function: ${timingFunc};
`;
