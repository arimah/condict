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
  z-index: 10;
  border-radius: 7px;
  border: 2px solid var(--border-control);
  background-color: var(--bg-control);
  color: var(--fg-control);
  box-shadow: var(--shadow-elevation-2);

  &:focus {
    outline: none;
  }
`;
