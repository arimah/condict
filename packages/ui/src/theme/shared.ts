import {Interpolation, css} from 'styled-components';

import {UIColors, TimingTheme, IntentProps} from './types';

export const Timing: TimingTheme = {
  motion: 'full',
  short: 100,
  long: 250,
};

export const intentVar =
  <K extends keyof UIColors>(variable: K) =>
    (props: IntentProps): UIColors[K] =>
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
