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
