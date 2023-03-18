import styled from 'styled-components';

import {FullWidth} from '../../ui';

export const TableContainer = styled(FullWidth).attrs({
  as: 'section',
})`
  margin-block: 16px;
  padding-block: 8px;
  overflow-x: auto;
  user-select: text;
`;

export const OldVersionNotice = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;

  > svg {
    flex: none;
  }
`;
