import styled, {css} from 'styled-components';

import {Button as ButtonBase} from '@condict/ui';

export const Main = styled.span`
  display: inline-flex;
  position: relative;
`;

export const Button = styled(ButtonBase)`
  flex: 1 1 auto;
  position: relative;
  z-index: 0;
  overflow: hidden;

  &:active {
    background-color: var(--button-bg);
  }
`;

export const Content = styled.span`
  position: relative;
  z-index: 1;
`;

export const Progress = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 0;
  background-color: var(--button-bg-pressed);
`;

export const Helper = styled.span.attrs({
  'aria-live': 'assertive',
  'aria-relevant': 'text',
  'aria-atomic': true,
})<{
  $visible: boolean;
}>`
  display: flex;
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: calc(100% + 32px);

  opacity: 0;
  transform: translateX(-50%);

  transition-property: opacity, bottom;
  transition-duration: ${p => p.theme.timing.short}ms;
  transition-timing-function: ease;

  pointer-events: none;

  ${p => p.$visible && css`
    ${Button}:focus + && {
      bottom: calc(100% + 8px);
      opacity: 1;
    }
  `}
`;

export const HelperContent = styled.span`
  display: block;
  margin-inline: auto;
  padding: 8px 12px;

  border-radius: 5px;
  background-color: var(--bg-bold);
  color: var(--fg-bold);
  box-shadow: var(--shadow-elevation-3);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    width: 11px;
    height: 11px;
    background-color: var(--bg-bold);
    transform: translate(-50%, -50%) rotate(45deg);
  }
`;
