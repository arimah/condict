import styled, {css} from 'styled-components';

import {intentVar, transition} from '../theme';
import Intent from '../intent';

export type IntentProps = {
  intent: Intent;
};

export type CheckedProps = {
  checked?: boolean;
};

export type DisabledProps = {
  disabled?: boolean;
};

export const Label = styled.label<DisabledProps>`
  display: inline-block;
  box-sizing: border-box;
  color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};

  ${transition('color')}
`;

export const SwitchContainer = styled.span`
  display: inline-block;
  margin-right: 5px;
  position: relative;
  vertical-align: -4px;
`;

export const Input = styled.input.attrs({
  type: 'checkbox' as string,
})`
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 20px;
  border-radius: 10px;

  &:focus {
    ${p => p.theme.focus.style}
    border: 2px solid ${p => p.theme.focus.color};
  }
`;

export const Switch = styled.span<IntentProps & CheckedProps & DisabledProps>`
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  top: 0;
  left: 0;
  width: 32px;
  height: 20px;
  border: 2px solid ${p => p.checked
    ? intentVar('altBg')
    : p.theme.general.borderColor
  };
  border-radius: 10px;
  background-color: ${p => p.checked
    ? intentVar('altBg')
    : p.theme.general.bg
  };

  ${transition('border-color, background-color')}

  ${Label}:hover & {
    border-color: ${p => p.checked && intentVar('hoverAltBg')};
    background-color: ${p => p.checked
      ? intentVar('hoverAltBg')
      : p => p.theme.general.hoverBg
    };
  }

  ${Label}:active & {
    border-color: ${p => p.checked && intentVar('activeAltBg')};
    background-color: ${p => p.checked
      ? intentVar('activeAltBg')
      : p.theme.general.activeBg
    };
  }

  ${p => p.disabled && css<CheckedProps>`
    &&& {
      border-color: ${p => p.theme.general[
        p.checked ? 'disabledBg' : 'disabledBorderColor'
      ]};
      background-color: ${p => p.theme.general[
        p.checked ? 'disabledBg' : 'bg'
      ]};
    }
  `}
`;

export const Dot = styled.span<CheckedProps & DisabledProps & IntentProps>`
  position: absolute;
  top: 2px;
  left: ${p => p.checked ? '14px' : '2px'};
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${p => p.theme.general[
    p.checked ? 'bg' :
    p.disabled ? 'disabledBorderColor' :
    'borderColor'
  ]};

  ${transition('left, background-color')}

  ${Label}:active & {
    left: ${p => p.checked ? '12px' : '4px'};
  }
`;
