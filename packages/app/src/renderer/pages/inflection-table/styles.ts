import styled from 'styled-components';

import {Selectable} from '../../ui';

export const TableContainer = styled(Selectable).attrs({
  as: 'section',
})`
  margin-block: 16px;
  padding-block: 8px;
  overflow-x: auto;
`;

export const Table = styled.table`
  border-collapse: collapse;

  th,
  td {
    padding: 6px;
    text-align: start;
    white-space: pre;
    border: 2px solid ${p => p.theme.general.border};
  }

  td {
    background-color: ${p => p.theme.defaultBg};
    color: ${p => p.theme.defaultFg};
  }

  th {
    font-weight: bold;
    background-color: ${p => p.theme.general.bg};
    color: ${p => p.theme.general.fg};
  }
`;
