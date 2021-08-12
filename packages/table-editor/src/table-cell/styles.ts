import styled, {css} from 'styled-components';

import {Table} from '../table-editor/styles';
import Colors from '../colors';

export type CellProps = {
  header: boolean;
  selected: boolean;
  disabled: boolean;
};

export const Cell = styled.td<CellProps>`
  position: relative;
  text-align: start;
  white-space: pre;
  min-width: 16px;
  cursor: default;

  border: 2px solid transparent;

  ${p => p.header ? css<CellProps>`
    font-weight: bold;
    background-color: ${p => p.theme.general[p.disabled ? 'disabledBg' : 'bg']};
    color: ${p => p.theme.general[p.disabled ? 'disabledFg' : 'fg']};
  ` : css<CellProps>`
    font-weight: normal;
    background-color: ${p => p.theme.defaultBg};
    color: ${p => p.disabled ? p.theme.general.disabledFg : p.theme.defaultFg};
  `}

  ${Table}:focus &,
  ${Table}.force-focus & {
    ${p => p.selected && css<CellProps>`
      background-color: ${p => Colors[p.theme.mode][
        p.header ? 'selectedHeaderBg' : 'selectedBg'
      ]};
    `}
  }
`;

export const CellDataWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export type CellBorderProps = {
  disabled: boolean;
  selected: boolean;
  focused: boolean;
};

export const CellBorder = styled.div<CellBorderProps>`
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  pointer-events: none;

  border: 2px solid ${p => p.theme.general[
    p.disabled ? 'disabledBorder' : 'border'
  ]};

  ${Table}:focus &,
  ${Table}.force-focus & {
    border-color: ${p =>
      p.focused ? p.theme.focus.color :
      p.selected ? Colors[p.theme.mode].selectedBorder :
      undefined
    };
    box-shadow: ${p => p.focused && p.theme.focus.shadow};
    z-index: ${p =>
      p.focused ? '2' :
      p.selected ? '1' :
      undefined
    };
  }
`;
