import styled, {StyledProps, css} from 'styled-components';

import {UIColors, intentVar} from '../theme';
import Intent from '../intent';

export type Props = {
  slim: boolean;
  bold: boolean;
  intent: Intent;
  borderless: boolean;
};

const buttonColor = (regular: keyof UIColors, bold: keyof UIColors) =>
  (props: StyledProps<Props>) => {
    const colors = props.theme[props.intent];
    return colors[props.bold ? bold : regular];
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

  color: ${buttonColor('fg', 'boldFg')};
  border-color: ${buttonColor('bg', 'boldBg')};
  background-color: ${buttonColor('bg', 'boldBg')};

  &:hover {
    background-color: ${buttonColor('hoverBg', 'boldHoverBg')};
    ${p => p.borderless && css<Props>`
      border-color: ${buttonColor('hoverBg', 'boldHoverBg')};
    `}
  }

  &:active,
  &.force-active {
    background-color: ${buttonColor('activeBg', 'boldActiveBg')};
    ${p => p.borderless && css<Props>`
      border-color: ${buttonColor('activeBg', 'boldActiveBg')};
    `}
  }

  &:disabled {
    color: ${buttonColor('disabledFg', 'boldDisabledFg')};
    border-color: ${buttonColor('disabledBg', 'boldDisabledBg')};
    background-color: ${buttonColor('disabledBg', 'boldDisabledBg')};
  }

  &:focus,
  &.force-focus {
    outline: none;
    border: 2px solid ${p => p.theme.focus.color};
    box-shadow:
      inset 0 0 0 1px ${p => p.theme.defaultBg},
      ${p => p.theme.focus.shadow};
  }

  > .mdi-icon {
    margin-block: -4px;
    vertical-align: -3px;
  }

  > .mdi-icon:first-child {
    margin-inline-start: -8px;
  }

  > .mdi-icon:not(:first-child) {
    margin-inline-start: 8px;
  }

  > .mdi-icon:last-child {
    margin-inline-end: -8px;
  }

  > .mdi-icon:not(:last-child) {
    margin-inline-end: 8px;
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
