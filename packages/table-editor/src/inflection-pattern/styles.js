import styled from 'styled-components';
import {ifProp} from 'styled-tools';

import {
  makeColorFn,
  LightTheme,
} from '@condict/ui';

export const stemColor = makeColorFn(291, {
  high: 70,
  low: 45,
});

// 'light' and 'dark' here mean for light and dark themes, respectively.
const lightStemColor = stemColor('high', 35);
const disabledLightStemColor = stemColor('low', 80);
const darkStemColor = stemColor('high', 65);
const disabledDarkStemColor = stemColor('low', 35);

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

const lightBraceColor = braceColor('high', 35);
const disabledLightBraceColor = braceColor('low', 80);
const darkBraceColor = braceColor('high', 60);
const disabledDarkBraceColor = braceColor('low', 30);

export const EscapedBrace = styled.span`
  color: ${ifProp('theme.dark',
    ifProp('disabled', disabledDarkBraceColor, darkBraceColor),
    ifProp('disabled', disabledLightBraceColor, lightBraceColor)
  )};
`;

EscapedBrace.defaultProps = {
  theme: LightTheme,
};
