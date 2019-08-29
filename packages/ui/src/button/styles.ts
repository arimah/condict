import styled, {css} from 'styled-components';

import {intentVar, transition} from '../theme';
import LightTheme from '../theme/light';
import Intent from '../intent';

export type Props = {
  slim: boolean;
  minimal: boolean;
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

  &:focus {
    border: 2px solid ${p => p.theme.focus.color};
    ${p => p.theme.focus.style}
  }

  ${p => p.minimal ? css<Props>`
    color: ${intentVar('fg')};
    border-color: transparent;
    background-color: transparent;

    &:hover {
      background-color: ${intentVar('hoverBg')};
    }

    &:active {
      background-color: ${intentVar('bg')};
    }

    &:disabled {
      color: ${intentVar('disabledFg')};
      background-color: transparent;
    }
  ` : css<Props>`
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
    }`}
`;

export const Button = styled.button<Props>`
  ${ButtonStyle}
`;

Button.defaultProps = {
  theme: LightTheme,
};

export const Link = styled.a<Props>`
  /* We have to do some extra work to override link styles :( */
  &:link,
  &:hover,
  &:active,
  &:visited {
    color: ${p => p.minimal ? intentVar('fg') : intentVar('altFg')};
    text-decoration: none;
  }

  ${ButtonStyle}
`;

Link.defaultProps = {
  theme: LightTheme,
};
