import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {intentVar} from '../theme';
import LightTheme from '../theme/light';

const Transition = property => css`
  transition-duration: ${theme('timing.short')};
  transition-timing-function: ease-in-out;
  transition-property: ${property};
`;

export const Label = styled.label`
  display: inline-block;
  box-sizing: border-box;
  color: ${ifProp('disabled', theme('general.disabledFg'), theme('general.fg'))};

  ${Transition('color')}
`;

Label.defaultProps = {
  theme: LightTheme,
};

export const CheckmarkContainer = styled.span`
  display: inline-block;
  box-sizing: border-box;
  margin-right: 5px;
  vertical-align: -3px;

  width: 18px;
  height: 18px;
  position: relative;

  border-radius: 3px;
  border-style: solid;
  border-width: 2px;

  ${Transition('border-color, background-color')}

  background-color: ${ifProp('checked',
    intentVar('altBg'),
    theme('general.bg')
  )};
  border-color: ${ifProp('checked',
    intentVar('altBg'),
    theme('general.borderColor')
  )};

  ${Label}:active & {
    border-color: ${ifProp('checked', intentVar('activeAltBg'))};
    background-color: ${ifProp('checked',
      intentVar('activeAltBg'),
      theme('general.activeBg')
    )};
  }

  ${ifProp('disabled', css`
    &&& {
      background-color: ${ifProp('checked',
        theme('general.disabledBg'),
        theme('general.bg')
      )};
      border-color: ${ifProp('checked',
        theme('general.disabledBg'),
        theme('general.disabledBorderColor')
      )};
    }
  `)}
`;

CheckmarkContainer.defaultProps = {
  theme: LightTheme,
};

export const Input = styled.input.attrs({type: 'checkbox'})`
  appearance: none;
  box-sizing: border-box;
  position: absolute;
  top: -2px;
  left: -2px;
  width: 18px;
  height: 18px;
  border-radius: 3px;

  &:focus {
    ${theme('focus.style')}
    border: 2px solid ${theme('focus.color')};
  }
`;

Input.defaultProps = {
  theme: LightTheme,
};

export const IndeterminateMark = styled.span`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 2px;
  background-color: ${theme('general.bg')};
  transform: translate(-50%, -50%);

  ${Transition('opacity')}

  opacity: ${ifProp('checked', '1', '0')};
`;

IndeterminateMark.defaultProps = {
  theme: LightTheme,
};

export const CheckMark = styled.span`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 6px;
  border-left: 2px solid ${theme('general.bg')};
  border-bottom: 2px solid ${theme('general.bg')};
  transform: translate(-50%, -75%) rotate(-45deg);

  ${Transition('opacity')}

  opacity: ${ifProp('checked', '1', '0')};
`;

CheckMark.defaultProps = {
  theme: LightTheme,
};
