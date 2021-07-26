import styled from 'styled-components';

export const Popup = styled.div.attrs({
  role: 'dialog',
  tabIndex: -1,
  'aria-modal': true,
})`
  visibility: hidden; /* until positioned */
  margin-top: 2px;
  box-sizing: border-box;
  overflow: hidden;
  position: absolute;
  z-index: 5;
  border-radius: 7px;
  border: 2px solid ${p => p.theme.general.border};
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};
  box-shadow: ${p => p.theme.shadow.elevation2};

  &:focus {
    outline: none;
  }
`;
