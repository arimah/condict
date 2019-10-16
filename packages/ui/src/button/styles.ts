import styled, {css} from 'styled-components';

import {intentVar, transition} from '../theme';
import Intent from '../intent';

export type Props = {
  slim: boolean;
  bold: boolean;
  intent: Intent;
};

export const ButtonStyle = css<Props>`
  display: inline-block;
  box-sizing: border-box;
  padding: ${p => p.slim ? '4px 6px' : '6px 14px'};
  font: inherit;
  font-weight: normal;
  text-align: center;
  border: 2px solid;
  border-radius: ${p => p.slim ? '4px' : '7px'};
  position: relative;

  ${transition('color, border-color, background-color')}

  &:focus,
  &.force-focus {
    border: 2px solid ${p => p.theme.focus.color};
    ${p => p.theme.focus.style}
  }

  ${p => p.bold ? css<Props>`
    color: ${intentVar('altFg')};
    border-color: ${intentVar('borderColor')};
    background-color: ${intentVar('altBg')};

    &:hover {
      background-color: ${intentVar('hoverAltBg')};
    }

    &:active {
      background-color: ${intentVar('activeAltBg')};
    }

    &:disabled {
      color: ${intentVar('disabledAltFg')};
      border-color: ${intentVar('disabledBorderColor')};
      background-color: ${intentVar('disabledAltBg')};
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
    margin-left: -6px;
  }

  > .mdi-icon:not(:first-child) {
    margin-left: 8px;
  }

  > .mdi-icon:last-child {
    margin-right: -6px;
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
    color: ${p => p.bold ? intentVar('altFg') : intentVar('fg')};
    text-decoration: none;
  }

  ${ButtonStyle}
`;
