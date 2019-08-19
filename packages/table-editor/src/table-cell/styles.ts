import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {LightTheme} from '@condict/ui';

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

  ${ifProp('header',
    css`
      font-weight: bold;
      background-color: ${ifProp('disabled',
        theme('general.disabledAltBg'),
        theme('general.altBg')
      )};
      color: ${ifProp('disabled',
        theme('general.disabledAltFg'),
        theme('general.altFg')
      )};
    `,
    css`
      font-weight: normal;
      background-color: ${theme('general.bg')};
      color: ${ifProp('disabled',
        theme('general.disabledFg'),
        theme('general.fg')
      )};
    `
  )}

  ${Table}:focus &,
  ${Table}.force-focus & {
    ${ifProp('selected', css`
      background-color: ${ifProp('header',
        theme('selection.altBg'),
        theme('selection.bg')
      )};
    `)}
  }
`;

Cell.defaultProps = {
  theme: LightTheme,
};

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

  border: 2px solid ${ifProp('disabled',
    theme('general.disabledBorderColor'),
    theme('general.borderColor')
  )};

  ${Table}:focus &,
  ${Table}.force-focus & {
    ${ifProp('focused', theme('focus.style'))}
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

CellBorder.defaultProps = {
  theme: LightTheme,
};
