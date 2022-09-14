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
  justify-content: flex-start;
  border-radius: 7px;

  --button-fg: var(--fg);
  --button-bg: var(--bg);
  --button-bg-hover: var(--bg-hover);
  --button-bg-pressed: var(--bg-pressed);
  --button-border: var(--border);
  --button-border-hover: var(--button-border);
  --button-border-pressed: var(--button-border);
`;

export const NoLemmas = styled(NonIdealState)`
  width: 320px;
`;

export const PartOfSpeechList = styled(CardGrid)`
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
`;
