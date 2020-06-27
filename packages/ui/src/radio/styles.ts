import styled from 'styled-components';

import {intentVar} from '../theme';
import Intent from '../intent';

export type IntentProps = {
  intent: Intent;
};

export type DisabledProps = {
  disabled?: boolean;
};

export const RadioContainer = styled.span`
  display: inline-block;
  box-sizing: border-box;
  margin-right: 5px;
  vertical-align: -3px;

  width: 18px;
  height: 18px;
  position: relative;

  border: 2px solid ${p => p.theme.general.borderColor};
  border-radius: 9px;
  background-color: ${p => p.theme.general.bg};
`;

export const RadioDot = styled.span<IntentProps>`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${intentVar('altBg')};
  transform: translate(-50%, -50%);
  opacity: 0;
`;

// Don't give the input a 0x0 size, as doing so will make it impossible for
// screen readers to locate it, and it also means you can't hover over it
// to have it announced.

export const Input = styled.input.attrs({type: 'radio'})<IntentProps>`
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &:checked + ${RadioContainer} {
    border-color: ${intentVar('altBg')};

    > ${RadioDot} {
      opacity: 1;
    }
  }

  &&&:disabled + ${RadioContainer} {
    border-color: ${p => p.theme.general.disabledBorderColor};
    background-color: ${p => p.theme.general.bg};

    > ${RadioDot} {
      background-color: ${p => p.theme.general.disabledBg};
    }
  }

  &:focus {
    outline: none;
  }

  &&&:focus + ${RadioContainer},
  &&&.force-focus + ${RadioContainer} {
    ${p => p.theme.focus.style}
    border: 2px solid ${p => p.theme.focus.color};
  }
`;

export const Label = styled.label<DisabledProps & IntentProps>`
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};

  &:hover {
    > ${RadioContainer} {
      background-color: ${p => p.theme.general.hoverBg};
    }

    > :checked + ${RadioContainer} {
      border-color: ${intentVar('hoverAltBg')};
      background-color: ${intentVar('hoverBg')};
    }
  }

  &:active {
    > ${RadioContainer} {
      background-color: ${p => p.theme.general.activeBg};
    }

    > :checked + ${RadioContainer} {
      border-color: ${intentVar('activeAltBg')};
      background-color: ${intentVar('bg')};
    }
  }
`;
