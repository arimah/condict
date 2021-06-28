import styled, {css} from 'styled-components';

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
  cursor: ${p => !p.disabled && 'text'};
  border-radius: 3px;
  border-color: ${p => p.theme.general.border};
  background-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  ${p => p.minimal ? css`
    padding: 2px;
    border-style: none;
  ` : css`
    padding: 0;
    border-width: 2px;
    border-style: solid;
  `}

  ${p => p.inputFocused && css<Props>`
    outline: none;
    padding: ${p => p.minimal && '0'};
    border: 2px solid ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  `}

  ${p => p.disabled && css`
    border-color: ${p => p.theme.general.disabledBorder};
    color: ${p => p.theme.general.disabledFg};
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
  max-width: calc(100% - 2px);
  font: inherit;
  text-align: start;
  background-color: ${p => p.theme.general.bg};
  border: 2px solid ${p => p.theme.general.bg};
  border-radius: 13px;
  color: ${p => p.theme.general.fg};
  cursor: default;

  ${p => p.disabled && css`
    &&& {
      padding-inline: 16px;
      background-color: ${p => p.theme.general.disabledBg};
      border-color: ${p => p.theme.general.disabledBg};
      color: ${p => p.theme.general.disabledFg};
    }
  `}

  &:hover {
    background-color: ${p => p.theme.danger.boldBg};
    border-color: ${p => p.theme.danger.boldBg};
    color: ${p => p.theme.danger.boldFg};
  }

  &:active {
    background-color: ${p => p.theme.danger.boldActiveBg};
    border-color: ${p => p.theme.danger.boldActiveBg};
    color: ${p => p.theme.danger.boldFg};
  }

  &:focus,
  &.force-focus {
    outline: none;
    border-color: ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }
`;

export const DeleteMarker = styled(DeleteIcon)`
  position: absolute;
  inset-inline-end: 8px;
  top: 50%;
  margin-top: -4px;
  pointer-events: none;
  opacity: 0.25;

  ${Tag}:hover &,
  ${Tag}:active & {
    opacity: 1;
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
  background-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  &:focus {
    outline: none;
  }

  &:disabled {
    color: ${p => p.theme.general.disabledFg};
  }
`;
