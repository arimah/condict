import styled from 'styled-components';

import MarkerLocation, {
  markerLocationToFlexDirection,
} from '../marker-location';

export const RadioDot = styled.span`
  display: none;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: currentColor;
  transform: translate(-50%, -50%);
`;

export const RadioContainer = styled.span`
  flex: none;
  display: inline-block;
  box-sizing: border-box;
  vertical-align: -3px;

  width: 16px;
  height: 16px;
  position: relative;

  border: 2px solid var(--radio-border);
  border-radius: 9px;
  background-color: var(--radio-bg);
  color: var(--radio-fg);

  *:hover > & {
    border-color: var(--radio-border-hover);
    background-color: var(--radio-bg-hover);
  }

  *:active > & {
    border-color: var(--radio-border-pressed);
    background-color: var(--radio-bg-pressed);
  }

  input:disabled + & {
    border-color: var(--radio-border-disabled);
    background-color: var(--radio-bg-disabled);
    color: var(--radio-fg-disabled);
  }

  input:checked + & {
    border-color: var(--radio-border-checked);
    background-color: var(--radio-bg-checked);

    > ${RadioDot} {
      display: block;
    }
  }

  *:hover > input:checked + & {
    border-color: var(--radio-border-checked-hover);
    background-color: var(--radio-bg-checked-hover);
  }

  *:active > input:checked + & {
    border-color: var(--radio-border-checked-pressed);
    background-color: var(--radio-bg-checked-pressed);
  }

  input:disabled:checked + & {
    border-color: var(--radio-border-checked-disabled);
    background-color: var(--radio-bg-checked-disabled);
  }
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

  &:focus {
    outline: none;
  }

  &:is(:focus, .force-focus) + ${RadioContainer}::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 18px;
    height: 18px;
    border: 2px solid var(--focus-border);
    border-radius: 11px;
  }
`;

export const Label = styled.label<{
  $disabled?: boolean;
  $marker: MarkerLocation;
}>`
  display: inline-flex;
  box-sizing: border-box;
  flex-direction: ${p => markerLocationToFlexDirection(p.$marker)};
  align-items: center;
  gap: 4px 8px;
  position: relative;
  vertical-align: top;
  color: var(${p => p.$disabled ? '--fg-disabled' : '--fg'});
`;

export const Content = styled.span``;
