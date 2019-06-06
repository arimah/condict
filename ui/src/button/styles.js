import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {intentVar} from '../theme';
import LightTheme from '../theme/light';

export const ButtonStyle = css`
  display: inline-block;
  box-sizing: border-box;
  padding: ${ifProp('slim', '4px 6px', '6px 14px')};
  font: inherit;
  font-weight: normal;
  text-align: center;
  border: 2px solid;
  border-radius: ${ifProp('slim', '4px', '7px')};
  position: relative;

  transition-duration: ${theme('timing.short')};
  transition-timing-function: ease-in-out;
  transition-property: color, border-color, background-color;

  &:focus {
    border: 2px solid ${theme('focus.color')};
    ${theme('focus.style')}
  }

  ${ifProp('minimal',
    css`
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
    `,
    css`
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
    `
  )}
`;

export const Button = styled.button`
  ${ButtonStyle}
`;

Button.defaultProps = {
  theme: LightTheme,
};

export const Link = styled.a`
  /* We have to do some extra work to override link styles :( */
  &:link,
  &:hover,
  &:active,
  &:visited {
    color: ${ifProp('minimal', intentVar('fg'), intentVar('altFg'))};
    text-decoration: none;
  }

  ${ButtonStyle}
`;

Link.defaultProps = {
  theme: LightTheme,
};
