import styled from 'styled-components';

import Colors from '../colors';

export type DisabledProps = {
  disabled: boolean;
};

export const InflectionStem = styled.span<DisabledProps>`
  color: ${p => p.theme.accent[p.disabled ? 'disabledFg' : 'defaultFg']};
`;

export const EscapedBrace = styled.span<DisabledProps>`
  color: ${p => Colors[p.theme.mode][
    p.disabled ? 'disabledBraceFg' : 'braceFg'
  ]};
`;
