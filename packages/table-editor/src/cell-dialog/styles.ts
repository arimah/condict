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
  inset-inline-start: -8px;
  z-index: 1;

  font-weight: normal;

  border: 2px solid ${p => p.theme.general.border};
  border-radius: 3px;
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};
  box-shadow: ${p => p.theme.shadow.elevation2};

  ::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: -7px;
    inset-inline-start: 10px;
    width: 11px;
    height: 11px;

    border-top: 2px solid ${p => p.theme.general.border};
    border-right: 2px solid ${p => p.theme.general.border};
    background-color: ${p => p.theme.general.bg};
    transform: rotate(-45deg);
  }
`;
