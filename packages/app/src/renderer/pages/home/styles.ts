import styled from 'styled-components';

import {Radio} from '@condict/ui';

export const OptionGroup = styled.div.attrs({
  role: 'group',
})`
  margin-bottom: 16px;
`;

export const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 8px;
  margin-bottom: 8px;
`;

export const Option = styled(Radio)`
  &:not(:first-child) {
    margin-top: 2px;
  }

  &:not(:last-child) {
    margin-bottom: 2px;
  }
`;
