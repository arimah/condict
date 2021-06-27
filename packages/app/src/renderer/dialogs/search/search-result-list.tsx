import {useRef, useEffect} from 'react';
import {Localized} from '@fluent/react';

import SearchResultComponent from './search-result';
import {SearchResult} from './types';
import * as S from './styles';

export type Props = {
  results: readonly SearchResult[];
  currentIndex: number;
  query: string;
  loading: boolean;
  hasScopes: boolean;
  scrollToCurrent: boolean;
  onHover: (index: number) => void;
  onClick: (result: SearchResult) => void;
};

const SearchResultList = (props: Props): JSX.Element | null => {
  const {
    results,
    currentIndex,
    query,
    loading,
    hasScopes,
    scrollToCurrent,
    onHover,
    onClick,
  } = props;

  const currentResultRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (scrollToCurrent) {
      currentResultRef.current?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [results, currentIndex]);

  if (!hasScopes) {
    // Always show a warning if the user unchecks all the scopes.
    return (
      <S.ResultText>
        <S.NoResultNotice>
          <Localized id='search-box-no-scopes'/>
        </S.NoResultNotice>
        <p><Localized id='search-box-no-scopes-helper'/></p>
      </S.ResultText>
    );
  }

  const hasResults = results.length > 0;
  if (query === '' || !hasResults && loading) {
    // Empty query could not possibly match anything.
    // If we have no results (from a previous search, i.e. query !== '') and
    // we are currently loading results from a new search, hide the previous
    // message about no results.
    return null;
  }

  if (!hasResults) {
    return (
      <S.ResultText>
        <S.NoResultNotice>
          <Localized
            id='search-box-no-results'
            elems={{query: <i/>}}
            vars={{query}}
          >
            <></>
          </Localized>
        </S.NoResultNotice>
        <p><Localized id='search-box-no-results-helper'/></p>
      </S.ResultText>
    );
  }

  return (
    <S.ResultList>
      {results.map((res, i) =>
        <SearchResultComponent
          key={`${res.type}(${res.id})`}
          result={res}
          index={i}
          selected={i === currentIndex}
          onHover={onHover}
          onClick={onClick}
          ref={i === currentIndex ? currentResultRef : undefined}
        />
      )}
    </S.ResultList>
  );
};

export default SearchResultList;
