import styled from 'styled-components';

import {FullWidth} from '../../ui';

export const TableContainer = styled(FullWidth)`
  margin-block: 8px 2px;
  padding-block: 4px 2px;
  overflow-x: auto;
  user-select: text;
`;

export const TableSource = styled.p`
  margin-block: 0 16px;
  font-style: italic;
`;
