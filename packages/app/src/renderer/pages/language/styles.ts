import styled from 'styled-components';

import {Button, NonIdealState} from '@condict/ui';

import {CardGrid} from '../../ui';

export const Search = styled.section`
  display: flex;
  margin: 24px auto;
  max-width: 632px;
`;

export const SearchButton = styled(Button)`
  flex: 1 1 auto;
  text-align: start;
  border-radius: 7px;
  border-color: ${p => p.theme.general.border};
  background-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  &:hover {
    background-color: ${p => p.theme.defaultHoverBg};
  }

  &:active {
    background-color: ${p => p.theme.defaultActiveBg};
  }
`;

export const NoLemmas = styled(NonIdealState)`
  width: 320px;
`;

export const PartOfSpeechName = styled.span`
  margin-inline-start: 16px;
  font-size: 15px;
  line-height: 16px;
`;

export const PartOfSpeechList = styled(CardGrid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
`;
