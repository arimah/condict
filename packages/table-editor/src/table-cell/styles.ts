import styled, {css} from 'styled-components';

import {Table} from '../table-editor/styles';

export type CellProps = {
  header: boolean;
  selected: boolean;
  disabled: boolean;
};

export const Cell = styled.td<CellProps>`
  position: relative;
  text-align: left;
  white-space: pre-wrap;
  min-width: 16px;
  cursor: default;

  border: 2px solid transparent;

  ${p => p.header ? css<CellProps>`
    font-weight: bold;
    background-color: ${p => p.theme.general[
      p.disabled ? 'disabledAltBg' : 'altBg'
    ]};
    color: ${p => p.theme.general[
      p.disabled ? 'disabledAltFg' : 'altFg'
    ]};
  ` : css<CellProps>`
    font-weight: normal;
    background-color: ${p => p.theme.general.bg};
    color: ${p => p.theme.general[
      p.disabled ? 'disabledFg' : 'fg'
    ]};
  `}

  ${Table}:focus &,
  ${Table}.force-focus & {
    ${p => p.selected && css<CellProps>`
      background-color: ${p => p.theme.selection[
        p.header ? 'altBg' : 'bg'
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
    p.disabled ? 'disabledBorderColor' : 'borderColor'
  ]};

  ${Table}:focus &,
  ${Table}.force-focus & {
    ${p => p.focused && p.theme.focus.style}
    border-color: ${props =>
      props.focused ? props.theme.focus.color :
      props.selected ? props.theme.selection.borderColor :
      undefined
    };
    z-index: ${props =>
      props.focused ? '2' :
      props.selected ? '1' :
      undefined
    };
  }
`;
