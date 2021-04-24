import React, {Ref, useMemo} from 'react';

import {Match} from '@condict/ipa';

import SearchResult from './search-result';
import ConvertResult from './convert-result';
import {HighlightedMatch} from './highlight-matches';
import * as S from './styles';

export type Props = {
  dialogId: string;
  query: string;
  results: readonly Result[];
  currentIndex: number;
  currentResultRef: Ref<HTMLElement>;
  onHover: (index: number) => void;
  onEmit: (ipa: string) => void;
};

export type Result = Match | FromXSampa;

export interface FromXSampa {
  readonly ipa: string;
}

export const isMatch = (result: Result): result is Match =>
  Array.isArray(result);

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
    {results.map((result, index) =>
      isMatch(result) ? (
        <SearchResult
          key={`${result[0].display} ${result[0].name}`}
          id={`${dialogId}-result-${index}`}
          char={result[0]}
          match={result[1]}
          index={index}
          selected={index === currentIndex}
          highlightCache={highlightCache}
          onMouseEnter={onHover}
          onClick={onEmit}
          ref={index === currentIndex ? currentResultRef : undefined}
        />
      ) : (
        <ConvertResult
          key='from-xsampa'
          id={`${dialogId}-result-${index}`}
          ipa={result.ipa}
          index={index}
          selected={index === currentIndex}
          onMouseEnter={onHover}
          onClick={onEmit}
          ref={index === currentIndex ? currentResultRef : undefined}
        />
      )
    )}
  </>;
};

export default SearchResultList;
