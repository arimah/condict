import styled from 'styled-components';
import {ifProp} from 'styled-tools';

import {
  makeColorFn,
  Saturation,
  LightTheme,
} from '@condict/admin-ui';

export const stemColor = makeColorFn(291, {
  high: 70,
  low: 45,
});

// 'light' and 'dark' here mean for light and dark themes, respectively.
const lightStemColor = stemColor(Saturation.high, 35);
const disabledLightStemColor = stemColor(Saturation.low, 80);
const darkStemColor = stemColor(Saturation.high, 65);
const disabledDarkStemColor = stemColor(Saturation.low, 35);

export const InflectionStem = styled.span`
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

const lightBraceColor = braceColor(Saturation.high, 35);
const disabledLightBraceColor = braceColor(Saturation.low, 80);
const darkBraceColor = braceColor(Saturation.high, 60);
const disabledDarkBraceColor = braceColor(Saturation.low, 30);

export const EscapedBrace = styled.span`
  color: ${ifProp('theme.dark',
    ifProp('disabled', disabledDarkBraceColor, darkBraceColor),
    ifProp('disabled', disabledLightBraceColor, lightBraceColor)
  )};
`;

EscapedBrace.defaultProps = {
  theme: LightTheme,
};
