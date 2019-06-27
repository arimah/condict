import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {intentVar, transition} from '../theme';
import LightTheme from '../theme/light';

export const Label = styled.label`
  display: inline-block;
  box-sizing: border-box;
  color: ${ifProp('disabled', theme('general.disabledFg'), theme('general.fg'))};

  ${transition('color')}
`;

Label.defaultProps = {
  theme: LightTheme,
};

export const RadioContainer = styled.span`
  display: inline-block;
  box-sizing: border-box;
  margin-right: 5px;
  vertical-align: -3px;
  width: 18px;
  height: 18px;
  position: relative;
  border-radius: 9px;
  background-color: ${theme('general.bg')};

  border: 2px solid ${ifProp('checked',
    intentVar('altBg'),
    theme('general.borderColor')
  )};

  ${transition('border-color, background-color')}

  ${Label}:hover & {
    border-color: ${ifProp('checked', intentVar('hoverAltBg'))};
    background-color: ${ifProp('checked',
      intentVar('hoverBg'),
      theme('general.hoverBg')
    )};
  }

  ${Label}:active & {
    border-color: ${ifProp('checked', intentVar('activeAltBg'))};
    background-color: ${ifProp('checked',
      intentVar('bg'),
      theme('general.activeBg')
    )};
  }

  ${ifProp('disabled', css`
    &&& {
      border-color: ${theme('general.disabledBorderColor')};
      background-color: ${theme('general.bg')};
    }
  `)}
`;

RadioContainer.defaultProps = {
  theme: LightTheme,
};

export const Input = styled.input.attrs({type: 'radio'})`
  appearance: none;
  position: absolute;
  top: -2px;
  left: -2px;
  width: 18px;
  height: 18px;
  border-radius: 9px;

  &:focus {
    ${theme('focus.style')}
    border: 2px solid ${theme('focus.color')};
  }
`;

Input.defaultProps = {
  theme: LightTheme,
};

export const RadioDot = styled.span`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  transform: translate(-50%, -50%);

  background-color: ${ifProp('disabled',
    theme('general.disabledBg'),
    intentVar('altBg')
  )};
  opacity: ${ifProp('checked', '1', '0')};

  ${Label}:hover & {
    background-color: ${intentVar('hoverAltBg')};
  }

  ${Label}:active & {
    background-color: ${intentVar('activeAltBg')};
  }

  ${transition('opacity, background-color')}
`;

RadioDot.defaultProps = {
  theme: LightTheme,
};
