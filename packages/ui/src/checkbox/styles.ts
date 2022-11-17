import styled from 'styled-components';

import MarkerLocation, {
  markerLocationToFlexDirection,
} from '../marker-location';

export const IndeterminateMark = styled.span`
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 2px;
  background-color: currentColor;
  transform: translate(-50%, -50%);
`;

export const CheckMark = styled.span`
  display: none;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 6px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: translate(-50%, -75%) rotate(-45deg);
`;

export const CheckmarkContainer = styled.span`
  flex: none;
  display: inline-block;
  box-sizing: border-box;
  vertical-align: -3px;

  width: 16px;
  height: 16px;
  position: relative;

  border: 2px solid var(--checkbox-border);
  border-radius: 3px;
  background-color: var(--checkbox-bg);
  color: var(--checkbox-fg);

  *:hover > & {
    border-color: var(--checkbox-border-hover);
    background-color: var(--checkbox-bg-hover);
  }

  *:active > & {
    border-color: var(--checkbox-border-pressed);
    background-color: var(--checkbox-bg-pressed);
  }

  input:disabled + & {
    border-color: var(--checkbox-border-disabled);
    background-color: var(--checkbox-bg-disabled);
    color: var(--checkbox-fg-disabled);
  }

  input:is(:checked, :indeterminate) + & {
    border-color: var(--checkbox-border-checked);
    background-color: var(--checkbox-bg-checked);
  }

  input:checked + & > ${CheckMark},
  input:indeterminate + & > ${IndeterminateMark} {
    display: block;
  }

  *:hover > input:is(:checked, :indeterminate) + & {
    border-color: var(--checkbox-border-checked-hover);
    background-color: var(--checkbox-bg-checked-hover);
  }

  *:active > input:is(:checked, :indeterminate) + & {
    border-color: var(--checkbox-border-checked-pressed);
    background-color: var(--checkbox-bg-checked-pressed);
  }

  input:disabled:is(:checked, :indeterminate) + & {
    border-color: var(--checkbox-border-checked-disabled);
    background-color: var(--checkbox-bg-checked-disabled);
  }
`;

// Don't give the input a 0x0 size, as doing so will make it impossible for
// screen readers to locate it, and it also means you can't hover over it
// to have it announced.

export const Input = styled.input.attrs({type: 'checkbox'})`
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &:focus {
    outline: none;
  }

  &:is(:focus, .force-focus) + ${CheckmarkContainer}::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 18px;
    height: 18px;
    border: 2px solid var(--focus-border);
    border-radius: 5px;
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
