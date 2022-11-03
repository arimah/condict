import styled from 'styled-components';

import MarkerLocation, {
  markerLocationToFlexDirection,
} from '../marker-location';

export const Dot = styled.span`
  position: absolute;
  top: 2px;
  inset-inline-start: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;

  transition: inset-inline-start ${p => p.theme.timing.short}ms ease-in-out;
`;

export const Switch = styled.span`
  flex: none;
  display: inline-block;
  box-sizing: border-box;
  vertical-align: -3px;

  width: 32px;
  height: 16px;
  position: relative;

  border: 2px solid var(--switch-border);
  border-radius: 10px;
  background-color: var(--switch-bg);
  color: var(--switch-fg);

  *:hover > & {
    border-color: var(--switch-border-hover);
    background-color: var(--switch-bg-hover);
  }

  *:active > & {
    border-color: var(--switch-border-pressed);
    background-color: var(--switch-bg-pressed);

    > ${Dot} {
      inset-inline-start: 4px;
    }
  }

  input:disabled + & {
    border-color: var(--switch-border-disabled);
    background-color: var(--switch-bg-disabled);
    color: var(--switch-fg-disabled);

    > ${Dot} {
      inset-inline-start: 2px;
    }
  }

  input:checked + & {
    border-color: var(--switch-border-checked);
    background-color: var(--switch-bg-checked);
    color: var(--switch-fg-checked);

    > ${Dot} {
      inset-inline-start: 18px;
    }
  }

  *:hover > input:checked + & {
    border-color: var(--switch-border-checked-hover);
    background-color: var(--switch-bg-checked-hover);
  }

  *:active > input:checked + & {
    border-color: var(--switch-border-checked-pressed);
    background-color: var(--switch-bg-checked-pressed);

    > ${Dot} {
      inset-inline-start: 16px;
    }
  }

  input:disabled:checked + & {
    border-color: var(--switch-border-checked-disabled);
    background-color: var(--switch-bg-checked-disabled);
    color: var(--switch-fg-checked-disabled);

    > ${Dot} {
      inset-inline-start: 18px;
    }
  }
`;

export const Input = styled.input.attrs({type: 'checkbox'})`
  appearance: none;
  position: absolute;
  top: 0;
  inset-inline-start: 2px;
  width: 100%;
  height: 100%;

  &:focus {
    outline: none;
  }

  &:is(:focus, .force-focus) + ${Switch}::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 34px;
    height: 18px;
    border: 2px solid var(--focus-border);
    border-radius: 11px;
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
  color: var(${p => p.disabled ? '--fg-disabled' : '--fg'});
`;

export const Content = styled.span``;
