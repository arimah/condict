import styled from 'styled-components';

export type MainProps = {
  visible: boolean;
};

export const Main = styled.div.attrs({
  role: 'dialog',
  tabIndex: -1,
})<MainProps>`
  box-sizing: border-box;
  padding: 20px;
  position: relative;
  top: ${p => p.visible ? '0' : '-24px'};
  background-color: ${p => p.theme.defaultBg};
  border-radius: 15px;
  box-shadow: 0 2px 7px rgba(0, 0, 0, ${p => p.theme.mode === 'dark' ? '0.8' : '0.6'});
  opacity: ${p => p.visible ? '1' : '0'};

  transition-property: top, opacity;
  transition-timing-function: ease-out, linear;
  /* At least 1ms to force transitionend event even with disabled animations. */
  transition-duration: ${p => Math.max(1.25 * p.theme.timing.short, 1)}ms;

  &:focus {
    outline: none;
  }
`;
