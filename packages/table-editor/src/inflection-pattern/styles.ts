import styled from 'styled-components';

export const InflectionStem = styled.span<{
  $disabled: boolean;
}>`
  color: var(${p => p.$disabled
    ? '--table-stem-fg-disabled'
    : '--table-stem-fg'
  });
`;

export const EscapedBrace = styled.span<{
  $disabled: boolean;
}>`
  color: var(${p => p.$disabled
    ? '--table-escape-fg-disabled'
    : '--table-escape-fg'
  });
`;
