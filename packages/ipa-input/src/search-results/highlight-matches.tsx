import React, {Fragment, Key} from 'react';

import * as S from './styles';

export type HighlightedMatch = JSX.Element | (string | JSX.Element)[];

const highlightMatches = (
  term: string,
  query: string,
  cache: Map<string, HighlightedMatch>,
  outerKey?: Key
) => {
  // Terms and queries should never contain newlines. (Famous last words?)
  const cacheKey = `${term}\n${query}\n${outerKey}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const termLower = term.toLowerCase();

  let result: HighlightedMatch;
  // Fast path: if the term starts with the query, we don't have to do any
  // of the manual traversing of the term and keeping track of gaps and such.
  if (termLower.startsWith(query)) {
    result =
      <Fragment key={outerKey}>
        <S.Match>{term.substr(0, query.length)}</S.Match>
        {term.substr(query.length)}
      </Fragment>;
  } else {
    // Slow path: walk termLower and query to find exactly which characters
    // match against each other. This is a partial reimplementation of the
    // search logic.
    result = [];

    // This is kind of sneaky, but the first character of the term and the
    // query are *assumed* to be the same. Currently they always are, but
    // if that changes, this code MUST be updated.
    let inMatch = true;
    let sectionStart = 0;
    for (let t = 0, q = 0; t < term.length; t++) {
      if (termLower[t] === query[q]) {
        q += 1;

        if (!inMatch) {
          inMatch = true;
          result.push(term.substring(sectionStart, t));
          sectionStart = t;
        }
      } else if (inMatch) {
        inMatch = false;
        result.push(
          <S.Match key={result.length}>
            {term.substring(sectionStart, t)}
          </S.Match>
        );
        sectionStart = t;
      }
    }

    const remainder = term.substring(sectionStart);
    result.push(
      inMatch
        ? <S.Match key={result.length}>{remainder}</S.Match>
        : remainder
    );
  }

  cache.set(cacheKey, result);
  return result;
};

export default highlightMatches;
