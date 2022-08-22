import styled from 'styled-components';

import MarkerLocation, {
  markerLocationToFlexDirection,
} from '../marker-location';

export type DisabledProps = {
  disabled?: boolean;
};

export const Switch = styled.span`
  flex: none;
  display: inline-block;
  box-sizing: border-box;
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
  inset-inline-start: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${p => p.theme.general.border};

  transition: inset-inline-start ${p => p.theme.timing.short}ms ease-in-out;
`;

export const Input = styled.input.attrs({type: 'checkbox'})`
  appearance: none;
  position: absolute;
  top: 0;
  inset-inline-start: 2px;
  width: 100%;
  height: 100%;

  &:checked + ${Switch} {
    border-color: ${p => p.theme.accent.boldBg};
    background-color: ${p => p.theme.accent.boldBg};

    > ${Dot} {
      inset-inline-start: 18px;
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
  color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};

  &:hover {
    > ${Switch} {
      background-color: ${p => p.theme.defaultHoverBg};
    }

    > :checked + ${Switch} {
      border-color: ${p => p.theme.accent.boldHoverBg};
      background-color: ${p => p.theme.accent.boldHoverBg};
    }
  }

  &:active {
    > ${Switch} {
      background-color: ${p => p.theme.defaultActiveBg};

      > ${Dot} {
        inset-inline-start: 4px;
      }
    }

    > :checked + ${Switch} {
      border-color: ${p => p.theme.accent.boldActiveBg};
      background-color: ${p => p.theme.accent.boldActiveBg};

      > ${Dot} {
        inset-inline-start: 16px;
      }
    }
  }
`;

export const Content = styled.span``;
