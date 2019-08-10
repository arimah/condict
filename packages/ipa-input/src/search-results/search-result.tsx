import React, {Fragment} from 'react';

import highlightMatches, {HighlightedMatch} from './highlight-matches';
import * as S from './styles';

type Props = {
  char: {
    input: string;
    display: string;
    nameWords: string[];
  };
  match: {
    terms: {
      term: string;
      query: string;
    }[];
  };
  highlightCache: Map<string, HighlightedMatch>;
};

const SearchResult = (props: Props) => {
  const {char, match, highlightCache} = props;

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
  return (
    <S.SearchResult>
      <S.SearchResultChar>
        {char.display}
      </S.SearchResultChar>
      <S.SearchResultName>
        {name}
        {remainingTerms.length > 0 &&
          <S.SecondaryTerms>
            {remainingTerms.map((t, index) =>
              <Fragment key={index}>
                {index == 0 ? ' (' : ' '}
                {highlightMatches(t.term, t.query, highlightCache)}
              </Fragment>
            )}
            {')'}
          </S.SecondaryTerms>}
      </S.SearchResultName>
    </S.SearchResult>
  );
};

export default SearchResult;
