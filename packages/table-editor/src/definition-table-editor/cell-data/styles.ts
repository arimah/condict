import styled from 'styled-components';

export const CellData = styled.div<{
  $inflected?: boolean;
  $custom?: boolean;
  $disabled?: boolean;
}>`
  flex: 1 0 auto;
  padding: 6px;
  font-style: ${p => p.$inflected && 'italic'};
  color: ${p => p.$custom && `var(${
    p.$disabled ? '--table-custom-form-fg-disabled' : '--table-custom-form-fg'
  })`};
`;

export const DeletedForm = styled.span<{
  $disabled: boolean;
}>`
  display: inline-block;
  width: 16px;
  height: 2px;
  vertical-align: middle;
  background-color: var(${p => p.$disabled
    ? '--table-deleted-form-fg-disabled'
    : '--table-deleted-form-fg'
  });
`;
