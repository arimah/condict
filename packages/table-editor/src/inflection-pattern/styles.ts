import styled from 'styled-components';
import {ifProp} from 'styled-tools';

import {
  makeColorFn,
  LightTheme,
  Saturation,
} from '@condict/ui';

export interface DisabledProps {
  disabled: boolean;
}

const stemColor = makeColorFn(291, {
  high: 70,
  low: 45,
});

// 'light' and 'dark' here mean for light and dark themes, respectively.
const lightStemColor = stemColor(Saturation.HIGH, 35);
const disabledLightStemColor = stemColor(Saturation.LOW, 80);
const darkStemColor = stemColor(Saturation.HIGH, 65);
const disabledDarkStemColor = stemColor(Saturation.LOW, 35);

export const InflectionStem = styled.span<DisabledProps>`
  color: ${ifProp('theme.dark',
    ifProp('disabled', disabledDarkStemColor, darkStemColor),
    ifProp('disabled', disabledLightStemColor, lightStemColor)
  )};
`;

InflectionStem.defaultProps = {
  theme: LightTheme,
};

const braceColor = makeColorFn(174, {
  high: 65,
  low: 40,
});

const lightBraceColor = braceColor(Saturation.HIGH, 35);
const disabledLightBraceColor = braceColor(Saturation.LOW, 80);
const darkBraceColor = braceColor(Saturation.HIGH, 60);
const disabledDarkBraceColor = braceColor(Saturation.LOW, 30);

export const EscapedBrace = styled.span<DisabledProps>`
  color: ${ifProp('theme.dark',
    ifProp('disabled', disabledDarkBraceColor, darkBraceColor),
    ifProp('disabled', disabledLightBraceColor, lightBraceColor)
  )};
`;

EscapedBrace.defaultProps = {
  theme: LightTheme,
};
