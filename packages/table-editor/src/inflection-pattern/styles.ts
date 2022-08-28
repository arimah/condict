import styled from 'styled-components';

export type DisabledProps = {
  disabled: boolean;
};

export const InflectionStem = styled.span<DisabledProps>`
  color: var(${p => p.disabled
    ? '--table-stem-fg-disabled'
    : '--table-stem-fg'
  });
`;

export const EscapedBrace = styled.span<DisabledProps>`
  color: var(${p => p.disabled
    ? '--table-escape-fg-disabled'
    : '--table-escape-fg'
  });
`;
