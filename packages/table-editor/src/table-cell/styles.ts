import styled, {css} from 'styled-components';

import {Table} from '../table-editor/styles';

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

  ${p => p.header ? `
    font-weight: bold;
    background-color: var(${p.disabled
      ? '--table-header-bg-disabled'
      : '--table-header-bg'
    });
    color: var(${p.disabled
      ? '--table-header-fg-disabled'
      : '--table-header-fg'
    });
  ` : `
    font-weight: normal;
    background-color: var(${p.disabled
      ? '--table-bg-disabled'
      : '--table-bg'
    });
    color: var(${p.disabled ? '--table-fg-disabled' : '--table-fg'});
  `}

  ${p => p.selected && css`
    ${Table}:is(:focus, .force-focus) & {
      background-color: var(${p.header
        ? '--table-header-bg-selected'
        : '--table-bg-selected'
      });
    }
  `}
`;

export const CellDataWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 28px;
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

  border: 2px solid var(${p => p.disabled
    ? '--table-border-disabled'
    : '--table-border'
  });

  ${Table}:is(:focus, .force-focus) & {
    border-color: ${p =>
      p.focused ? 'var(--focus-border)' :
      p.selected ? 'var(--table-border-selected)' :
      undefined
    };
    box-shadow: ${p => p.focused && 'var(--focus-shadow)'};
    z-index: ${p =>
      p.focused ? '2' :
      p.selected ? '1' :
      undefined
    };
  }
`;
