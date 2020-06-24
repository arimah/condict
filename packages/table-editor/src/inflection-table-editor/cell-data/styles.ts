import styled from 'styled-components';

export type CellIconsProps = {
  disabled: boolean;
};

// NOTE: This styling must be synchronized with the one in ../cell-editor/styles
export const CellIcons = styled.div<CellIconsProps>`
  display: block;
  margin-left: 5px;
  margin-right: 5px;

  opacity: ${p => p.disabled && '0.4'};

  > svg {
    display: block;
  }

  > svg:not(:first-child) {
    margin-top: 2px;
  }
`;

export const CellData = styled.div`
  flex: 1 0 auto;
  padding: 6px 0 6px 6px;

  &:last-child {
    padding-right: 6px;
  }
`;
