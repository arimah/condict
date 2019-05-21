import styled, {css} from 'styled-components';
import {prop, theme, ifProp} from 'styled-tools';

import LightTheme from '../theme/light';

const Transition = property => css`
  transition-duration: ${theme('timing.short')};
  transition-timing-function: ease-in-out;
  transition-property: ${property};
`;

export const Input = styled.input`
  box-sizing: border-box;
  font: inherit;
  border-radius: ${prop('borderRadius', '3px')};
  border-color: ${theme('general.borderColor')};
  background-color: ${theme('general.bg')};
  color: ${theme('general.fg')};

  ${Transition('border-color, color')}

  ${ifProp('minimal',
    css`
      padding: 6px;
      border-style: none;
    `,
    css`
      padding: 4px;
      border-width: 2px;
      border-style: solid;
    `
  )}

  ${ifProp('autoSize', css`
    /* Edge's "x" button; it messes up the size calculation. */
    &::-ms-clear {
      display: none;
    }
  `)}

  &:focus {
    ${theme('focus.style')}
    padding: ${ifProp('minimal', '4px')};
    border: 2px solid ${theme('focus.color')};
  }

  &:disabled {
    border-color: ${theme('general.disabledBorderColor')};
    color: ${theme('general.disabledFg')};
  }

  &::placeholder {
    ${Transition('color')}
    color: ${theme('general.fg')};
    opacity: 0.65;
  }

  &:disabled::placeholder {
    color: ${theme('general.disabledFg')};
  }
`;

Input.defaultProps = {
  theme: LightTheme,
};
