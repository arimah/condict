import styled from 'styled-components';

import {Selectable, CardGrid} from '../../ui';

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 12px;
  gap: 16px;

  > button {
    flex: none;
    align-self: flex-start;
    min-width: 96px;
  }
`;

export const LanguageName = styled(Selectable).attrs({
  as: 'h1',
})`
  flex: 1 1 auto;
  && {
    margin-block: 0;
  }
`;

export const PartOfSpeechList = styled(CardGrid).attrs({
  as: 'section',
})`
  grid-template-columns: 1fr 1fr;

  @media (min-width: 960px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;
