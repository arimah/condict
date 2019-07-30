import styled from 'styled-components';
import {theme, ifProp} from 'styled-tools';

import {LightTheme} from '@condict/ui';

export const TableWrapper = styled.div``;

export const Table = styled.table`
  border-collapse: collapse;
  border: 1px solid ${theme('general.borderColor')};

  &:focus {
    /* The table manages its own internal focus. */
    outline: none;
  }
`;

Table.defaultProps = {
  theme: LightTheme,
};

export const Helper = styled.div`
  margin-top: 8px;
  font-size: 14px;

  color: ${ifProp('disabled',
    theme('general.disabledFg'),
    theme('general.fg')
  )};
`;

Helper.defaultProps = {
  theme: LightTheme,
};
