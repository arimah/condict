import styled from 'styled-components';

export type CellIconsProps = {
  disabled: boolean;
};

// NOTE: This styling must be synchronized with the one in ../cell-editor/styles
export const CellIcons = styled.div<CellIconsProps>`
  display: block;
  margin-inline: 5px;

  ${p => p.disabled && `
    opacity: 0.6;
    filter: grayscale(0.6);
  `}

  > svg {
    display: block;
  }

  > svg:not(:first-child) {
    margin-top: 2px;
  }
`;

export const CellData = styled.div`
  flex: 1 0 auto;
  padding-block: 6px;
  padding-inline: 6px 0;

  &:last-child {
    padding-inline-end: 6px;
  }
`;
