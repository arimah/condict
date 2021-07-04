import styled from 'styled-components';

import {intentVar} from '../theme';
import Intent from '../intent';
import MarkerLocation, {
  markerLocationToFlexDirection,
} from '../marker-location';

export type IntentProps = {
  intent: Intent;
};

export type DisabledProps = {
  disabled?: boolean;
};

export const CheckmarkContainer = styled.span`
  flex: none;
  display: inline-block;
  box-sizing: border-box;
  vertical-align: -3px;

  width: 16px;
  height: 16px;
  position: relative;

  border: 2px solid ${p => p.theme.general.border};
  border-radius: 3px;
  background-color: ${p => p.theme.defaultBg};
`;

export const IndeterminateMark = styled.span`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 2px;
  background-color: ${p => p.theme.defaultBg};
  transform: translate(-50%, -50%);
  opacity: 0;
`;

export const CheckMark = styled.span`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 6px;
  border-left: 2px solid ${p => p.theme.defaultBg};
  border-bottom: 2px solid ${p => p.theme.defaultBg};
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
      border-color: ${intentVar('boldBg')};
      background-color: ${intentVar('boldBg')};
    }
  }

  &&:disabled {
    + ${CheckmarkContainer} {
      border-color: ${p => p.theme.general.disabledBorder};
      background-color: ${p => p.theme.defaultBg};
    }

    &:checked + ${CheckmarkContainer},
    &:indeterminate + ${CheckmarkContainer} {
      border-color: ${p => p.theme.general.disabledBorder};
      background-color: ${p => p.theme.general.disabledBorder};
    }
  }

  &:checked + ${CheckmarkContainer} > ${CheckMark},
  &:indeterminate + ${CheckmarkContainer} > ${IndeterminateMark} {
    opacity: 1;
  }

  &:focus {
    outline: none;
  }

  &:focus + ${CheckmarkContainer}::after,
  &.force-focus + ${CheckmarkContainer}::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 18px;
    height: 18px;
    border: 2px solid ${p => p.theme.focus.color};
    border-radius: 5px;
    box-shadow: ${p => p.theme.focus.shadow};
  }
`;

export type LabelProps = IntentProps & {
  disabled?: boolean;
  marker: MarkerLocation;
};

export const Label = styled.label<LabelProps>`
  display: inline-flex;
  box-sizing: border-box;
  flex-direction: ${p => markerLocationToFlexDirection(p.marker)};
  align-items: center;
  gap: 4px 8px;
  position: relative;
  vertical-align: top;
  color: ${p => p.disabled ? p.theme.general.disabledFg : p.theme.defaultFg};

  &:hover {
    > ${CheckmarkContainer} {
      background-color: ${p => p.theme.defaultHoverBg};
    }

    > :checked + ${CheckmarkContainer},
    > :indeterminate + ${CheckmarkContainer} {
      border-color: ${intentVar('boldHoverBg')};
      background-color: ${intentVar('boldHoverBg')};
    }
  }

  &:active {
    > ${CheckmarkContainer} {
      background-color: ${p => p.theme.defaultActiveBg};
    }

    > :checked + ${CheckmarkContainer},
    > :indeterminate + ${CheckmarkContainer} {
      border-color: ${intentVar('boldActiveBg')};
      background-color: ${intentVar('boldActiveBg')};
    }
  }
`;

export const Content = styled.span``;
