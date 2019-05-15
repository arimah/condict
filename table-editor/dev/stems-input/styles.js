import styled from 'styled-components';

import {TextInput} from '@condict/admin-ui';

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

export const NameInput = styled(TextInput)`
  width: 100px;
  font-weight: bold;
`;

export const ValueInput = styled(TextInput)`
  width: 300px;
`;
