import React, {Fragment, Ref, useMemo} from 'react';

import {IpaChar, MatchInfo} from '@condict/ipa';

import highlightMatches, {HighlightedMatch} from './highlight-matches';
import * as S from './styles';

export type Props = {
  id: string;
  char: IpaChar;
  match: MatchInfo;
  index: number;
  selected: boolean;
  highlightCache: Map<string, HighlightedMatch>;
  onMouseEnter: (index: number) => void;
  onClick: (ipa: string) => void;
};

const SearchResult = React.memo(React.forwardRef((
  props: Props,
  ref: Ref<HTMLElement>
): JSX.Element => {
  const {
    id,
    char,
    match,
    index,
    selected,
    highlightCache,
    onMouseEnter,
    onClick,
  } = props;

  const name = useMemo(() => {
    const drawnMatches = new Set(
      match.terms
        .filter(t => char.input.startsWith(t.term))
        .map(t => t.term)
    );

    const name = [];
    for (let i = 0; i < char.nameWords.length; i++) {
      if (i > 0) {
        name.push(' ');
      }

      const word = char.nameWords[i];
      const wordLower = word.toLowerCase();
      const wordMatch = match.terms.find(t => t.term === wordLower);
      if (wordMatch) {
        drawnMatches.add(wordMatch.term);
        name.push(highlightMatches(word, wordMatch.query, highlightCache, i));
      } else {
        name.push(word);
      }
    }

    const remainingTerms = match.terms.filter(t => !drawnMatches.has(t.term));
    return <>
      {name}
      {remainingTerms.length > 0 &&
        <S.SecondaryTerms>
          {' ('}
          {remainingTerms.map((t, index) =>
            <Fragment key={index}>
              {index > 0 && ' '}
              {highlightMatches(t.term, t.query, highlightCache)}
            </Fragment>
          )}
          {')'}
        </S.SecondaryTerms>}
    </>;
  }, [char, match]);

  return (
    <S.Result
      id={id}
      selected={selected}
      aria-selected={selected}
      onMouseEnter={() => onMouseEnter(index)}
      onClick={() => onClick(char.input)}
      ref={ref as Ref<HTMLDivElement>}
    >
      <S.SearchResultChar>
        {char.display}
      </S.SearchResultChar>
      <S.SearchResultName>
        {name}
      </S.SearchResultName>
    </S.Result>
  );
}));

SearchResult.displayName = 'SearchResult';

export default SearchResult;
