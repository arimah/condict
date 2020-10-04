import styled from 'styled-components';

import {PrimaryHue} from '@condict/ui';

export type DisabledProps = {
  disabled: boolean;
};

// 'light' and 'dark' here mean for light and dark themes, respectively.
const lightStemColor = `hsl(${PrimaryHue}, 70%, 35%)`;
const disabledLightStemColor = `hsl(${PrimaryHue}, 45%, 80%)`;
const darkStemColor = `hsl(${PrimaryHue}, 70%, 65%)`;
const disabledDarkStemColor = `hsl(${PrimaryHue}, 45%, 35%)`;

export const InflectionStem = styled.span<DisabledProps>`
  color: ${p => p.theme.dark
    ? (p.disabled ? disabledDarkStemColor : darkStemColor)
    : (p.disabled ? disabledLightStemColor : lightStemColor)
  };
`;

/** Turquoise. */
const BraceHue = 174;

const lightBraceColor = `hsl(${BraceHue}, 65%, 35%)`;
const disabledLightBraceColor = `hsl(${BraceHue}, 40%, 80%)`;
const darkBraceColor = `hsl(${BraceHue}, 65%, 60%)`;
const disabledDarkBraceColor = `hsl(${BraceHue}, 40%, 30%)`;

export const EscapedBrace = styled.span<DisabledProps>`
  color: ${p => p.theme.dark
    ? (p.disabled ? disabledDarkBraceColor : darkBraceColor)
    : (p.disabled ? disabledLightBraceColor : lightBraceColor)
  };
`;
