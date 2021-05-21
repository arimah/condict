import styled, {css} from 'styled-components';

import {intentVar} from '../theme';
import Intent from '../intent';

export type Props = {
  slim: boolean;
  bold: boolean;
  intent: Intent;
};

export const ButtonStyle = css<Props>`
  display: inline-block;
  box-sizing: border-box;
  padding: ${p => p.slim ? '2px 10px' : '6px 14px'};
  font: inherit;
  font-weight: normal;
  text-align: center;
  border: 2px solid;
  border-radius: ${p => p.slim ? '3px' : '7px'};
  position: relative;

  &:focus,
  &.force-focus {
    outline: none;
    border: 2px solid ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }

  ${p => p.bold ? css<Props>`
    color: ${intentVar('boldFg')};
    border-color: ${intentVar('boldBg')};
    background-color: ${intentVar('boldBg')};

    &:hover {
      background-color: ${intentVar('boldHoverBg')};
    }

    &:active {
      background-color: ${intentVar('boldActiveBg')};
    }

    &:disabled {
      color: ${intentVar('boldDisabledFg')};
      border-color: ${intentVar('boldDisabledBg')};
      background-color: ${intentVar('boldDisabledBg')};
    }
  ` : css<Props>`
    color: ${intentVar('fg')};
    border-color: ${intentVar('bg')};
    background-color: ${intentVar('bg')};

    &:hover {
      background-color: ${intentVar('hoverBg')};
    }

    &:active {
      background-color: ${intentVar('activeBg')};
    }

    &:disabled {
      color: ${intentVar('disabledFg')};
      border-color: ${intentVar('disabledBg')};
      background-color: ${intentVar('disabledBg')};
    }
  `}

  > .mdi-icon {
    margin-top: -4px;
    margin-bottom: -4px;
    vertical-align: -3px;
  }

  > .mdi-icon:first-child {
    margin-left: -8px;
  }

  > .mdi-icon:not(:first-child) {
    margin-left: 8px;
  }

  > .mdi-icon:last-child {
    margin-right: -8px;
  }

  > .mdi-icon:not(:last-child) {
    margin-right: 8px;
  }
`;

export const Button = styled.button<Props>`
  ${ButtonStyle}
`;

export const Link = styled.a<Props>`
  /* We have to do some extra work to override link styles :( */
  &:link,
  &:hover,
  &:active,
  &:visited {
    color: ${p => p.bold ? intentVar('boldFg') : intentVar('fg')};
    text-decoration: none;
  }

  ${ButtonStyle}
`;
