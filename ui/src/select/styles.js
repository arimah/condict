import styled, {css} from 'styled-components';
import {prop, theme, ifProp} from 'styled-tools';

import {transition} from '../theme';
import LightTheme from '../theme/light';

export const Wrapper = styled.span`
  display: inline-block;
  position: relative;
`;

export const Select = styled.select`
  appearance: none;
  font: inherit;
  border-radius: ${prop('borderRadius', '3px')};
  border-color: ${theme('general.borderColor')};
  background-color: ${theme('general.bg')};
  color: ${theme('general.fg')};

  ${transition('border-color, color, background-color')}

  ${ifProp('minimal',
    css`
      padding: 6px 28px 6px 9px;
      border-style: none;
    `,
    css`
      padding: 4px 26px 4px 7px;
      border-width: 2px;
      border-style: solid;
    `
  )}

  &:hover {
    background-color: ${theme('general.hoverBg')};
  }

  &:focus {
    ${theme('focus.style')}
    padding: ${ifProp('minimal', '4px 26px 4px 7px')};
    border: 2px solid ${theme('focus.color')};
  }

  &:disabled {
    border-color: ${theme('general.disabledBorderColor')};
    background-color: ${theme('general.bg')};
    color: ${theme('general.disabledFg')};
  }
`;

Select.defaultProps = {
  theme: LightTheme,
};

export const Arrow = styled.svg.attrs({
  width: '8',
  height: '8',
})`
  display: block;
  position: absolute;
  top: 50%;
  right: 10px;
  pointer-events: none;
  transform: translate(0, -50%);

  ${transition('color')}

  color: ${ifProp('disabled',
    theme('general.disabledFg'),
    theme('general.fg')
  )};
`;

Arrow.defaultProps = {
  theme: LightTheme,
};
