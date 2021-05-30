import styled from 'styled-components';

import {intentVar, transition} from '../theme';
import Intent from '../intent';

export type IntentProps = {
  intent: Intent;
};

export type DisabledProps = {
  disabled?: boolean;
};

export const Switch = styled.span`
  display: inline-block;
  box-sizing: border-box;
  margin-right: 8px;
  position: relative;
  width: 32px;
  height: 16px;
  vertical-align: -3px;
  border: 2px solid ${p => p.theme.general.border};
  border-radius: 10px;
  background-color: ${p => p.theme.defaultBg};
`;

export const Dot = styled.span`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${p => p.theme.general.border};

  ${transition('left')}
`;

export const Input = styled.input.attrs({type: 'checkbox'})<IntentProps>`
  appearance: none;
  position: absolute;
  top: 0;
  left: 2px;
  width: 100%;
  height: 100%;

  &:checked + ${Switch} {
    border-color: ${intentVar('boldBg')};
    background-color: ${intentVar('boldBg')};

    > ${Dot} {
      left: 18px;
      background-color: ${p => p.theme.defaultBg};
    }
  }

  &&&:disabled {
    + ${Switch} {
      border-color: ${p => p.theme.general.disabledBorder};
      background-color: ${p => p.theme.defaultBg};

      > ${Dot} {
        background-color: ${p => p.theme.general.disabledBorder};
      }
    }

    &:checked + ${Switch} {
      border-color: ${p => p.theme.general.disabledBorder};
      background-color: ${p => p.theme.general.disabledBorder};

      > ${Dot} {
        background-color: ${p => p.theme.defaultBg};
      }
    }
  }

  &:focus {
    outline: none;
  }

  &:focus + ${Switch}::after,
  &.force-focus + ${Switch}::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 34px;
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
  color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};

  &:hover {
    > ${Switch} {
      background-color: ${p => p.theme.defaultHoverBg};
    }

    > :checked + ${Switch} {
      border-color: ${intentVar('boldHoverBg')};
      background-color: ${intentVar('boldHoverBg')};
    }
  }

  &:active {
    > ${Switch} {
      background-color: ${p => p.theme.defaultActiveBg};

      > ${Dot} {
        left: 4px;
      }
    }

    > :checked + ${Switch} {
      border-color: ${intentVar('boldActiveBg')};
      background-color: ${intentVar('boldActiveBg')};

      > ${Dot} {
        left: 16px;
      }
    }
  }
`;
