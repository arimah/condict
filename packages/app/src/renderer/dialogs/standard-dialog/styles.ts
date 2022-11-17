import styled from 'styled-components';

export const Main = styled.div.attrs({
  role: 'dialog',
  tabIndex: -1,
})<{
  $visible: boolean;
}>`
  box-sizing: border-box;
  padding: 20px;
  position: relative;
  top: ${p => p.$visible ? '0' : '-24px'};
  background-color: var(--bg);
  border-radius: 15px;
  box-shadow: var(--dialog-shadow);
  opacity: ${p => p.$visible ? '1' : '0'};

  transition-property: top, opacity;
  transition-timing-function: ease-out, linear;
  /* At least 1ms to force transitionend event even with disabled animations. */
  transition-duration: ${p => Math.max(1.25 * p.theme.timing.short, 1)}ms;

  &:focus {
    outline: none;
  }
`;
