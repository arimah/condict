import styled from 'styled-components';

export const CellDialog = styled.div.attrs({
  role: 'dialog',
  tabIndex: -1,
  'aria-modal': true,
})`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  z-index: 3;

  &:focus {
    outline: none;
  }
`;
