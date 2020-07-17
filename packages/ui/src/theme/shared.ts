import {Interpolation, css} from 'styled-components';

import {IntentTheme, TimingTheme, IntentProps} from './types';

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

export type SaturationMap = {
  high: number;
  low: number;
};

export const enum Saturation {
  HIGH = 'high',
  LOW = 'low',
}

const DefaultSaturationMap: SaturationMap = {
  high: 100,
  low: 25,
};

export const makeColorFn =
  (hue: number, saturationMap: SaturationMap = DefaultSaturationMap) =>
    (sat: Saturation, lum: number): string => {
      const effectiveSat = saturationMap[sat];
      return `hsl(${hue}, ${effectiveSat}%, ${lum}%)`;
    };

// Purple
export const primaryColor = makeColorFn(291, {
  high: 70,
  low: 45,
});

// Blue with a tiny bit of green (bluish grey)
export const secondaryColor = makeColorFn(200, {
  high: 15,
  low: 10,
});

// Red with the tiniest hint of green
export const dangerColor = makeColorFn(1, {
  high: 90,
  low: 50,
});

// Blue with a tiny bit of green (bluish grey)
export const generalColor = makeColorFn(200, {
  high: 15,
  low: 10,
});

// Greenish blue
export const focusColor = makeColorFn(200, {
  high: 95,
  low: 60,
});

// Greenish blue, with less green
export const selectionColor = makeColorFn(205, {
  high: 95,
  low: 60,
});
