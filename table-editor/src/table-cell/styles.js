import styled, {css} from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {LightTheme} from '@condict/admin-ui';

import {Table} from '../table-editor/styles';

export const Cell = styled.td`
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

  ${Table}:focus & {
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

export const CellBorder = styled.div`
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

  ${Table}:focus & {
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
