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
  margin-right: 5px;
  position: relative;
  overflow: hidden;
  width: 32px;
  height: 20px;
  vertical-align: -4px;
  border: 2px solid ${p => p.theme.general.borderColor};
  border-radius: 10px;
  background-color: ${p => p.theme.general.bg};

  ${transition('border-color, background-color')}
`;

export const Dot = styled.span`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${p => p.theme.general.borderColor};

  ${transition('left, background-color')}
`;

export const Input = styled.input.attrs({type: 'checkbox'})<IntentProps>`
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &:checked + ${Switch} {
    border-color: ${intentVar('altBg')};
    background-color: ${intentVar('altBg')};

    > ${Dot} {
      left: 14px;
      background-color: ${p => p.theme.general.bg};
    }
  }

  &&&:disabled {
    + ${Switch} {
      border-color: ${p => p.theme.general.disabledBorderColor};
      background-color: ${p => p.theme.general.bg};

      > ${Dot} {
        background-color: ${p => p.theme.general.disabledBg};
        left: 2px;
      }
    }

    &:checked + ${Switch} {
      border-color: ${p => p.theme.general.disabledBg};
      background-color: ${p => p.theme.general.disabledBg};

      > ${Dot} {
        background-color: ${p => p.theme.general.bg};
        left: 14px;
      }
    }
  }

  &:focus {
    outline: none;
  }

  &&&:focus + ${Switch},
  &&&.force-focus + ${Switch} {
    ${p => p.theme.focus.style}
    border: 2px solid ${p => p.theme.focus.color};
  }
`;

export const Label = styled.label<DisabledProps & IntentProps>`
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};

  ${transition('color')}

  &:hover {
    > ${Switch} {
      background-color: ${p => p.theme.general.hoverBg};
    }

    > :checked + ${Switch} {
      border-color: ${intentVar('hoverAltBg')};
      background-color: ${intentVar('hoverAltBg')};
    }
  }

  &:active {
    > ${Switch} {
      background-color: ${p => p.theme.general.activeBg};

      > ${Dot} {
        left: 4px;
      }
    }

    > :checked + ${Switch} {
      border-color: ${intentVar('activeAltBg')};
      background-color: ${intentVar('activeAltBg')};

      > ${Dot} {
        left: 12px;
      }
    }
  }
`;
