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

export const CheckmarkContainer = styled.span<IntentProps & CheckedProps & DisabledProps>`
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

  ${transition('border-color, background-color')}

  background-color: ${p => p.checked
    ? intentVar('altBg')
    : p.theme.general.bg
  };
  border-color: ${p => p.checked
    ? intentVar('altBg')
    : p.theme.general.borderColor
  };

  ${Label}:hover & {
    border-color: ${p => p.checked && intentVar('hoverAltBg')};
    background-color: ${p => p.checked
      ? intentVar('hoverAltBg')
      : p.theme.general.hoverBg
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
      background-color: ${p => p.checked
        ? p.theme.general.disabledBg
        : p.theme.general.bg
      };
      border-color: ${p => p.checked
        ? p.theme.general.disabledBg
        : p.theme.general.disabledBorderColor
      };
    }
  `}
`;

export const Input = styled.input.attrs({type: 'checkbox'})`
  appearance: none;
  box-sizing: border-box;
  position: absolute;
  top: -2px;
  left: -2px;
  width: 18px;
  height: 18px;
  border-radius: 3px;

  &:focus,
  &.force-focus {
    ${p => p.theme.focus.style}
    border: 2px solid ${p => p.theme.focus.color};
  }
`;

export const IndeterminateMark = styled.span<CheckedProps>`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 2px;
  background-color: ${p => p.theme.general.bg};
  transform: translate(-50%, -50%);

  ${transition('opacity')}

  opacity: ${p => p.checked ? '1' : '0'};
`;

export const CheckMark = styled.span<CheckedProps>`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 6px;
  border-left: 2px solid ${p => p.theme.general.bg};
  border-bottom: 2px solid ${p => p.theme.general.bg};
  transform: translate(-50%, -75%) rotate(-45deg);

  ${transition('opacity')}

  opacity: ${p => p.checked ? '1' : '0'};
`;
