import styled from 'styled-components';

import {DeleteIcon} from './icons';

export type Props = {
  minimal?: boolean;
  disabled?: boolean;
  inputFocused: boolean;
};

export const Main = styled.span<Props>`
  display: inline-flex;
  box-sizing: border-box;
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: 3px;
  border: 2px solid var(--input-border);
  background-color: var(--input-bg);
  color: var(--input-fg);
  cursor: ${p => !p.disabled && 'text'};

  ${p => p.minimal && `
    --input-border: var(--input-minimal-border);
    --input-border-disabled: var(--input-minimal-border);
  `}

  ${p => p.inputFocused && `
    outline: none;
    border-color var(--focus-border);
    border-style: var(--focus-border-style);
    box-shadow: var(--focus-shadow);
  `}

  ${p => p.disabled && `
    border-color: var(--input-border-disabled);
    background-color: var(--input-bg-disabled);
    color: var(--input-fg-disabled);
  `}
`;

export const Tag = styled.button.attrs({
  type: 'button',
})`
  display: inline-block;
  box-sizing: border-box;
  flex: none;
  margin: 2px;
  padding-block: 2px;
  padding-inline: 8px 24px;
  position: relative;
  max-width: calc(100% - 4px);
  font: inherit;
  text-align: start;
  background-color: var(--button-bg);
  border: 2px solid var(--button-border);
  border-radius: 13px;
  color: var(--button-fg);
  cursor: default;

  &:hover {
    background-color: var(--button-bg-hover);
    border-color: var(--button-border-hover);
    color: var(--button-fg-hover);
  }

  &:active {
    background-color: var(--button-bg-pressed);
    border-color: var(--button-border-pressed);
    color: var(--button-fg-pressed);
  }

  &:disabled {
    padding-inline: 16px;
    background-color: var(--button-bg-disabled);
    border-color: var(--button-border-disabled);
    color: var(--button-fg-disabled);
  }

  &:is(:focus, .force-focus) {
    outline: none;
    border-color: var(--focus-border);
    border-style: var(--focus-border-style);
    box-shadow: var(--focus-shadow);
  }
`;

export const DeleteMarker = styled(DeleteIcon)`
  position: absolute;
  inset-inline-end: 8px;
  top: 50%;
  margin-top: -4px;
  pointer-events: none;
  opacity: 0.25;

  ${Tag}:is(:hover, :active) & {
    opacity: 0.8;
  }
`;

export const Input = styled.input.attrs({
  type: 'text',
})`
  box-sizing: border-box;
  flex: 1 1 auto;
  padding: 6px 4px;
  font: inherit;
  min-width: 72px;
  border: none;
  border-radius: 0;
  background-color: var(--input-bg);
  color: var(--input-fg);

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: var(--input-bg-disabled);
    color: var(--input-fg-disabled);
  }
`;
