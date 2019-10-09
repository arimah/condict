import styled, {css} from 'styled-components';

import {intentVar, transition} from '../theme';
import Intent from '../intent';

export type IntentProps = {
  intent: Intent;
};

export type DisabledProps = {
  disabled?: boolean;
};

export type CheckedProps = {
  checked?: boolean;
};

export const Label = styled.label<DisabledProps>`
  display: inline-block;
  box-sizing: border-box;
  color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};

  ${transition('color')}
`;

export const RadioContainer = styled.span<CheckedProps & DisabledProps & IntentProps>`
  display: inline-block;
  box-sizing: border-box;
  margin-right: 5px;
  vertical-align: -3px;
  width: 18px;
  height: 18px;
  position: relative;
  border-radius: 9px;
  background-color: ${p => p.theme.general.bg};

  border: 2px solid ${p => p.checked
    ? intentVar('altBg')
    : p.theme.general.borderColor
  };

  ${transition('border-color, background-color')}

  ${Label}:hover & {
    border-color: ${p => p.checked && intentVar('hoverAltBg')};
    background-color: ${p => p.checked
      ? intentVar('hoverBg')
      : p.theme.general.hoverBg
    };
  }

  ${Label}:active & {
    border-color: ${p => p.checked && intentVar('activeAltBg')};
    background-color: ${p => p.checked
      ? intentVar('bg')
      : p => p.theme.general.activeBg
    };
  }

  ${p => p.disabled && css`
    &&& {
      border-color: ${p => p.theme.general.disabledBorderColor};
      background-color: ${p => p.theme.general.bg};
    }
  `}
`;

export const Input = styled.input.attrs({type: 'radio'})`
  appearance: none;
  position: absolute;
  top: -2px;
  left: -2px;
  width: 18px;
  height: 18px;
  border-radius: 9px;

  &:focus {
    ${p => p.theme.focus.style}
    border: 2px solid ${p => p.theme.focus.color};
  }
`;

export const RadioDot = styled.span<CheckedProps & DisabledProps & IntentProps>`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  transform: translate(-50%, -50%);

  background-color: ${p => p.disabled
    ? p.theme.general.disabledBg
    : intentVar('altBg')
  };
  opacity: ${p => p.checked ? '1' : '0'};

  ${Label}:hover & {
    background-color: ${intentVar('hoverAltBg')};
  }

  ${Label}:active & {
    background-color: ${intentVar('activeAltBg')};
  }

  ${transition('opacity, background-color')}
`;
