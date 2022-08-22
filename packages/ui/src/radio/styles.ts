import styled from 'styled-components';

import MarkerLocation, {
  markerLocationToFlexDirection,
} from '../marker-location';

export type DisabledProps = {
  disabled?: boolean;
};

export const RadioContainer = styled.span`
  flex: none;
  display: inline-block;
  box-sizing: border-box;
  vertical-align: -3px;

  width: 16px;
  height: 16px;
  position: relative;

  border: 2px solid ${p => p.theme.general.border};
  border-radius: 9px;
  background-color: ${p => p.theme.defaultBg};
`;

export const RadioDot = styled.span`
  display: block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${p => p.theme.accent.boldBg};
  transform: translate(-50%, -50%);
  opacity: 0;
`;

// Don't give the input a 0x0 size, as doing so will make it impossible for
// screen readers to locate it, and it also means you can't hover over it
// to have it announced.

export const Input = styled.input.attrs({type: 'radio'})`
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &:checked + ${RadioContainer} {
    border-color: ${p => p.theme.accent.boldBg};

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

export type LabelProps = {
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
    > ${RadioContainer} {
      background-color: ${p => p.theme.defaultHoverBg};
    }

    > :checked + ${RadioContainer} {
      border-color: ${p => p.theme.accent.boldHoverBg};
      background-color: ${p => p.theme.accent.hoverBg};
    }
  }

  &:active {
    > ${RadioContainer} {
      background-color: ${p => p.theme.defaultActiveBg};
    }

    > :checked + ${RadioContainer} {
      border-color: ${p => p.theme.accent.boldActiveBg};
      background-color: ${p => p.theme.accent.bg};
    }
  }
`;

export const Content = styled.span``;
