import styled from 'styled-components';

import {DeleteIcon} from './icons';

export type Props = {
  minimal?: boolean;
  disabled?: boolean;
  inputFocused: boolean;
};

export const Main = styled.span.attrs({
  role: 'application',
})<Props>`
  display: inline-flex;
  box-sizing: border-box;
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: 3px;
  border: 2px solid var(${p =>
    p.disabled ? '--input-border-disabled' :
    p.inputFocused ? '--focus-border' :
    '--input-border'
  });
  background-color: var(${p => p.disabled
    ? '--input-bg-disabled'
    : '--input-bg'
  });
  color: var(${p => p.disabled
    ? '--input-fg-disabled'
    : '--input-fg'
  });
  cursor: ${p => !p.disabled && 'text'};

  ${p => p.minimal && `
    --input-border: var(--input-minimal-border);
    --input-border-disabled: var(--input-minimal-border);
  `}
`;

export const Tag = styled.button.attrs({
  type: 'button',
  tabIndex: -1,
})`
  display: inline-block;
  box-sizing: border-box;
  flex: none;
  margin: 2px;
  padding-block: 1px;
  padding-inline: 10px 26px;
  position: relative;
  max-width: calc(100% - 4px);
  min-height: 24px;
  font: inherit;
  text-align: start;
  background-color: var(--button-bg);
  border: 2px solid var(--button-border);
  border-radius: 18px;
  color: var(--button-fg);
  cursor: default;

  &:hover {
    background-color: var(--button-bg-hover);
    border-color: var(--button-border-hover);
  }

  &:active {
    background-color: var(--button-bg-pressed);
    border-color: var(--button-border-pressed);
  }

  &:disabled {
    padding-inline: 18px;
    background-color: var(--button-bg-disabled);
    border-color: var(--button-border-disabled);
    color: var(--button-fg-disabled);
  }

  &:is(:focus, .force-focus) {
    outline: none;
    border-color: var(--focus-border);
    box-shadow: inset 0 0 0 1px var(--input-bg);
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
  size: 1,
})`
  box-sizing: border-box;
  flex: 1 1 auto;
  padding: 5px 4px;
  min-width: 72px;
  min-height: 28px;
  font: inherit;
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
