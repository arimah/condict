import React, {Ref, useMemo} from 'react';

import {Match} from '@condict/ipa';

import SearchResult from './search-result';
import {HighlightedMatch} from './highlight-matches';
import * as S from './styles';

export type Props = {
  dialogId: string;
  query: string;
  results: readonly Match[];
  currentIndex: number;
  currentResultRef: Ref<HTMLElement>;
  onHover: (index: number) => void;
  onEmit: (ipa: string) => void;
};

const SearchResultList = (props: Props): JSX.Element => {
  const {
    dialogId,
    query,
    results,
    currentIndex,
    currentResultRef,
    onHover,
    onEmit,
  } = props;

  const highlightCache = useMemo(() => new Map<string, HighlightedMatch>(), []);

  if (results.length === 0) {
    return (
      <div id={`${dialogId}-no-results`}>
        <S.NoSearchResults>
          No matches for <i>{query}</i>.
        </S.NoSearchResults>
        <S.NoResultsSuggestion>
          Check your spelling or try a less specific query.
        </S.NoResultsSuggestion>
      </div>
    );
  }

  return <>
    {results.map(([char, match], index) =>
      <SearchResult
        key={`${char.display} ${char.name}`}
        id={`${dialogId}-result-${index}`}
        char={char}
        match={match}
        index={index}
        selected={index === currentIndex}
        highlightCache={highlightCache}
        onMouseEnter={onHover}
        onClick={onEmit}
        ref={index === currentIndex ? currentResultRef : undefined}
      />
    )}
  </>;
};

export default SearchResultList;
