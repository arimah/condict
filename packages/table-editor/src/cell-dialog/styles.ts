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

export const CellPopup = styled.div`
  box-sizing: border-box;
  margin-top: 5px;
  padding: 14px;
  position: absolute;
  top: 100%;
  left: -8px;
  z-index: 1;

  font-weight: normal;

  border: 2px solid ${p => p.theme.general.borderColor};
  border-radius: 3px;
  background-color: ${p => p.theme.general.altBg};
  color: ${p => p.theme.general.altFg};
  box-shadow: ${p => p.theme.shadow.elevation2};

  ::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: -7px;
    left: 10px;
    width: 11px;
    height: 11px;

    border-top: 2px solid ${p => p.theme.general.borderColor};
    border-right: 2px solid ${p => p.theme.general.borderColor};
    background-color: ${p => p.theme.general.altBg};
    transform: rotate(-45deg);
  }
`;
