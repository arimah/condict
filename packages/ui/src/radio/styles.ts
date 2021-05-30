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
  margin-right: 8px;
  vertical-align: -3px;

  width: 16px;
  height: 16px;
  position: relative;

  border: 2px solid ${p => p.theme.general.border};
  border-radius: 9px;
  background-color: ${p => p.theme.defaultBg};
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
  background-color: ${intentVar('boldBg')};
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
    border-color: ${intentVar('boldBg')};

    > ${RadioDot} {
      opacity: 1;
    }
  }

  &&&:disabled + ${RadioContainer} {
    border-color: ${p => p.theme.general.disabledBorder};
    background-color: ${p => p.theme.defaultBg};

    > ${RadioDot} {
      background-color: ${p => p.theme.general.disabledBorder};
    }
  }

  &:focus {
    outline: none;
  }

  &:focus + ${RadioContainer}::after,
  &.force-focus + ${RadioContainer}::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 18px;
    height: 18px;
    border: 2px solid ${p => p.theme.focus.color};
    border-radius: 11px;
    box-shadow: ${p => p.theme.focus.shadow};
  }
`;

export const Label = styled.label<DisabledProps & IntentProps>`
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  color: ${p => p.disabled ? p.theme.general.disabledFg : p.theme.defaultFg};

  &:hover {
    > ${RadioContainer} {
      background-color: ${p => p.theme.defaultHoverBg};
    }

    > :checked + ${RadioContainer} {
      border-color: ${intentVar('boldHoverBg')};
      background-color: ${intentVar('hoverBg')};
    }
  }

  &:active {
    > ${RadioContainer} {
      background-color: ${p => p.theme.defaultActiveBg};
    }

    > :checked + ${RadioContainer} {
      border-color: ${intentVar('boldActiveBg')};
      background-color: ${intentVar('bg')};
    }
  }
`;
