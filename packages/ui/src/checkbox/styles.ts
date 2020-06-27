import styled from 'styled-components';

import {intentVar} from '../theme';
import Intent from '../intent';

export type IntentProps = {
  intent: Intent;
};

export type DisabledProps = {
  disabled?: boolean;
};

export const CheckmarkContainer = styled.span`
  display: inline-block;
  box-sizing: border-box;
  margin-right: 5px;
  vertical-align: -3px;

  width: 18px;
  height: 18px;
  position: relative;

  border: 2px solid ${p => p.theme.general.borderColor};
  border-radius: 3px;
  background-color: ${p => p.theme.general.bg};
`;

export const IndeterminateMark = styled.span`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 2px;
  background-color: ${p => p.theme.general.bg};
  transform: translate(-50%, -50%);
  opacity: 0;
`;

export const CheckMark = styled.span`
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
  opacity: 0;
`;

// Don't give the input a 0x0 size, as doing so will make it impossible for
// screen readers to locate it, and it also means you can't hover over it
// to have it announced.

export const Input = styled.input.attrs({type: 'checkbox'})<IntentProps>`
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &:checked,
  &:indeterminate {
    + ${CheckmarkContainer} {
      border-color: ${intentVar('altBg')};
      background-color: ${intentVar('altBg')};
    }
  }

  &&:disabled {
    + ${CheckmarkContainer} {
      border-color: ${p => p.theme.general.disabledBorderColor};
      background-color: ${p => p.theme.general.bg};
    }

    &:checked + ${CheckmarkContainer},
    &:indeterminate + ${CheckmarkContainer} {
      border-color: ${p => p.theme.general.disabledBg};
      background-color: ${p => p.theme.general.disabledBg};
    }
  }

  &:checked + ${CheckmarkContainer} > ${CheckMark},
  &:indeterminate + ${CheckmarkContainer} > ${IndeterminateMark} {
    opacity: 1;
  }

  &:focus {
    outline: none;
  }

  &&&:focus + ${CheckmarkContainer},
  &&&.force-focus + ${CheckmarkContainer} {
    ${p => p.theme.focus.style}
    border-color: ${p => p.theme.focus.color};
  }
`;

export const Label = styled.label<DisabledProps & IntentProps>`
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};

  &:hover {
    > ${CheckmarkContainer} {
      background-color: ${p => p.theme.general.hoverBg};
    }

    > :checked + ${CheckmarkContainer},
    > :indeterminate + ${CheckmarkContainer} {
      border-color: ${intentVar('hoverAltBg')};
      background-color: ${intentVar('hoverAltBg')};
    }
  }

  &:active {
    > ${CheckmarkContainer} {
      background-color: ${p => p.theme.general.activeBg};
    }

    > :checked + ${CheckmarkContainer},
    > :indeterminate + ${CheckmarkContainer} {
      border-color: ${intentVar('activeAltBg')};
      background-color: ${intentVar('activeAltBg')};
    }
  }
`;
