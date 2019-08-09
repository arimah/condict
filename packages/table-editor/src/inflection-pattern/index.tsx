import React from 'react';

import * as S from './styles';

const CurlyBrace = /\{/;

export interface Props {
  pattern: string;
  disabled: boolean;
}

const InflectionPattern = React.memo((props: Props) => {
  const {pattern, disabled} = props;

  // If the pattern doesn't contain any '{' at all (unlikely), we can
  // just return it as-is.
  if (!CurlyBrace.test(pattern)) {
    // FIXME: Return the string as soon as TypeScript allows it.
    return <>{pattern}</>;
  }

  const parts = [];
  let lastTextPartStart = 0;
  // The React key attached to each highlighted inflection form. We shouldn't
  // use genId() here: doing so means the key will change every time the cell
  // is rerendered, which forces unnecessary DOM updates. A consistent key
  // will lead to fewer DOM updates.
  let key = 0;

  const regex = /(\{\{|\}\})|(\{([^{}]+)\})/g;

  let match;
  while ((match = regex.exec(pattern)) !== null) {
    if (lastTextPartStart < match.index) {
      parts.push(pattern.substring(lastTextPartStart, match.index));
    }

    if (match[1]) {
      // Escaped '{'
      parts.push(
        <S.EscapedBrace key={key} disabled={disabled}>
          {match[1]}
        </S.EscapedBrace>
      );
    } else {
      // Inflection pattern
      parts.push(
        <S.InflectionStem key={key} disabled={disabled}>
          {match[2]}
        </S.InflectionStem>
      );
    }

    key++;
    lastTextPartStart = match.index + match[0].length;
  }

  if (lastTextPartStart < pattern.length) {
    parts.push(pattern.substring(lastTextPartStart, pattern.length));
  }

  // FIXME: Return the array as soon as TypeScript allows it.
  return <>{parts}</>;
});

InflectionPattern.displayName = 'InflectionPattern';

export default InflectionPattern;
