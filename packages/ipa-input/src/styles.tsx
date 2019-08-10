import styled from 'styled-components';
import {theme} from 'styled-tools';

import {TextInput} from '@condict/ui';

export const Main = styled.div`
  padding: 8px;
  width: 380px;
  border-radius: 4px;
  background-color: ${theme('general.altBg')};
  box-shadow: ${theme('shadow.elevation1')};
`;

export const SearchWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 6px;
`;

export const SearchInput = styled(TextInput)`
  flex: 1 1 auto;
`;

export const CharacterList = styled.div`
  max-height: 260px;
  overflow: auto;
`;
