import React, {useState} from 'react';

import * as S from './styles';
import SearchResults from './search-results';
import CharacterListing from './character-listing';

const hasQuery = (q: string) => !/^\s*$/.test(q);

export const IpaInput = (): JSX.Element => {
  const [query, setQuery] = useState('');

  return (
    <S.Main>
      <S.SearchWrapper>
        <S.SearchInput
          minimal
          value={query}
          placeholder='f, ng, alveolar sibilant, high tone, ...'
          onChange={e => setQuery(e.target.value)}
        />
      </S.SearchWrapper>
      <S.CharacterList>
        {hasQuery(query)
          ? <SearchResults query={query}/>
          : <CharacterListing/>
        }
      </S.CharacterList>
    </S.Main>
  );
};
