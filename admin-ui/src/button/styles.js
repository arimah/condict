import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {intentVar} from '../theme';
import LightTheme from '../theme/light';

export const ButtonStyle = css`
  display: inline-block;
  box-sizing: border-box;
  padding: ${ifProp('slim', '6px 8px', '8px 16px')};
  font: inherit;
  font-weight: normal;
  text-align: center;
  border: none;
  border-radius: ${ifProp('slim', '4px', '7px')};
  position: relative;

  transition-duration: ${theme('timing.short')};
  transition-timing-function: ease-in-out;
  transition-property: color, background-color;

  &:focus {
    padding: ${ifProp('slim', '4px 6px', '6px 14px')};
    border: 2px solid ${theme('focus.color')};
    ${theme('focus.style')}
  }

  ${ifProp('minimal',
    css`
      color: ${intentVar('fg')};
      background-color: transparent;

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
      background-color: ${intentVar('altBg')};

      &:active {
        background-color: ${intentVar('activeAltBg')};
      }

      &:disabled {
        color: ${intentVar('disabledAltFg')};
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
  ${ButtonStyle}
  text-decoration: none;
`;

Link.defaultProps = {
  theme: LightTheme,
};

export const ShimmerWrapper = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  border-radius: ${ifProp('slim', '4px', '7px')};
`;
