import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {intentVar, transition} from '../theme';
import LightTheme from '../theme/light';

export const Label = styled.label`
  display: inline-block;
  box-sizing: border-box;
  color: ${ifProp('disabled',
    theme('general.disabledFg'),
    theme('general.fg')
  )};

  ${transition('color')}
`;

Label.defaultProps = {
  theme: LightTheme,
};

export const SwitchContainer = styled.span`
  display: inline-block;
  margin-right: 5px;
  position: relative;
  vertical-align: -4px;
`;

export const Input = styled.input.attrs({type: 'checkbox'})`
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 20px;
  border-radius: 10px;

  &:focus {
    ${theme('focus.style')}
    border: 2px solid ${theme('focus.color')};
  }
`;

Input.defaultProps = {
  theme: LightTheme,
};

export const Switch = styled.span`
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  top: 0;
  left: 0;
  width: 32px;
  height: 20px;
  border: 2px solid ${ifProp('checked',
    intentVar('altBg'),
    theme('general.borderColor')
  )};
  border-radius: 10px;
  background-color: ${ifProp('checked',
    intentVar('altBg'),
    theme('general.bg')
  )};

  ${transition('border-color, background-color')}

  ${Label}:hover & {
    border-color: ${ifProp('checked', intentVar('hoverAltBg'))};
    background-color: ${ifProp('checked',
      intentVar('hoverAltBg'),
      theme('general.hoverBg')
    )};
  }

  ${Label}:active & {
    border-color: ${ifProp('checked', intentVar('activeAltBg'))};
    background-color: ${ifProp('checked',
      intentVar('activeAltBg'),
      theme('general.activeBg')
    )};
  }

  ${ifProp('disabled', css`
    &&& {
      border-color: ${ifProp('checked',
        theme('general.disabledBg'),
        theme('general.disabledBorderColor')
      )};
      background-color: ${ifProp('checked',
        theme('general.disabledBg'),
        theme('general.bg')
      )};
    }
  `)}
`;

Switch.defaultProps = {
  theme: LightTheme,
};

export const Dot = styled.span`
  position: absolute;
  top: 2px;
  left: ${ifProp('checked', '14px', '2px')};
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${props =>
    props.checked ? props.theme.general.bg :
    props.disabled ? props.theme.general.disabledBorderColor :
    props.theme.general.borderColor
  };

  ${transition('left, background-color')}

  ${Label}:active & {
    left: ${ifProp('checked', '12px', '4px')};
  }
`;

Dot.defaultProps = {
  theme: LightTheme,
};
