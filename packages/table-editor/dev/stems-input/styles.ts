import styled from 'styled-components';

import {TextInput} from '@condict/ui';

export const List = styled.ul`
  margin-top: 8px;
  margin-bottom: 8px;
  padding-left: 24px;
  list-style-type: disc;
`;

export const Item = styled.li`
  &:not(:first-child) {
    margin-top: 4px;
  }
`;

export const ValueInput = styled(TextInput)`
  width: 300px;
`;
