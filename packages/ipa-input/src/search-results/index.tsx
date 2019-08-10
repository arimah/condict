import React from 'react';

import ipa from '@condict/ipa';

import SearchResult from './search-result';
import {HighlightedMatch} from './highlight-matches';
import * as S from './styles';

interface NoSearchResultsProps {
  query: string;
}

const NoSearchResults = ({query}: NoSearchResultsProps) =>
  <>
    <S.NoSearchResults>
      No matches for <i>{query}</i>.
    </S.NoSearchResults>
    <S.NoResultsSuggestion>
      Check your spelling or try a less specific query.
    </S.NoResultsSuggestion>
  </>;

export interface Props {
  query: string;
}

const SearchResults = React.memo((props: Props) => {
  const {query} = props;

  const results = ipa.search(query);
  const highlightCache = new Map<string, HighlightedMatch>();
  return (
    <>
      {results.length === 0 && <NoSearchResults query={query}/>}
      {results.map(([char, match], index) =>
        <SearchResult
          key={index}
          char={char}
          match={match}
          highlightCache={highlightCache}
        />
      )}
    </>
  );
});

SearchResults.displayName = 'SearchResults';

export default SearchResults;
