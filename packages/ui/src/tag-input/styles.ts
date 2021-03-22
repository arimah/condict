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
  border-color: ${p => p.theme.general.borderColor};
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};

  ${p => p.minimal ? css`
    padding: 2px;
    border-style: none;
  ` : css`
    padding: 0;
    border-width: 2px;
    border-style: solid;
  `}

  ${p => p.inputFocused && css<Props>`
    ${p => p.theme.focus.style}
    padding: ${p => p.minimal && '0'};
    border: 2px solid ${p => p.theme.focus.color};
  `}

  ${p => p.disabled && css`
    border-color: ${p => p.theme.general.disabledBorderColor};
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
  padding: 2px 24px 2px 8px;
  position: relative;
  max-width: calc(100% - 2px);
  font: inherit;
  text-align: left;
  background-color: ${p => p.theme.general.altBg};
  border: 2px solid ${p => p.theme.general.altBg};
  border-radius: 13px;
  color: ${p => p.theme.general.altFg};
  cursor: default;

  ${p => p.disabled && css`
    &&& {
      padding-left: 16px;
      padding-right: 16px;
      background-color: ${p => p.theme.general.disabledAltBg};
      border-color: ${p => p.theme.general.disabledAltBg};
      color: ${p => p.theme.general.disabledAltFg};
    }
  `}

  &:hover {
    background-color: ${p => p.theme.danger.hoverAltBg};
    border-color: ${p => p.theme.danger.hoverAltBg};
    color: ${p => p.theme.danger.altFg};
  }

  &:active {
    background-color: ${p => p.theme.danger.activeAltBg};
    border-color: ${p => p.theme.danger.activeAltBg};
    color: ${p => p.theme.danger.altFg};
  }

  &:focus,
  &.force-focus {
    ${p => p.theme.focus.style}
    outline: none;
    border-color: ${p => p.theme.focus.color};
  }
`;

export const DeleteMarker = styled(DeleteIcon)`
  position: absolute;
  right: 8px;
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
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};

  &:focus {
    outline: none;
  }

  &:disabled {
    color: ${p => p.theme.general.disabledFg};
  }
`;
