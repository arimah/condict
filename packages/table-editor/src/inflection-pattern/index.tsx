import React from 'react';

import {tokenizePattern} from '@condict/inflect';

import * as S from './styles';

const CurlyBrace = /[{}]/;

export type Props = {
  pattern: string;
  disabled: boolean;
};

const InflectionPattern = React.memo((props: Props) => {
  const {pattern, disabled} = props;

  // If the pattern doesn't contain any '{' or '}' at all (unlikely), we can
  // just return it as-is.
  if (!CurlyBrace.test(pattern)) {
    // FIXME: Return the string as soon as TypeScript allows it.
    return <>{pattern}</>;
  }

  // The React key attached to each highlighted inflection form. We shouldn't
  // use genId() here: doing so means the key will change every time the cell
  // is rerendered, which forces unnecessary DOM updates. A consistent key
  // will lead to fewer DOM updates.
  let key = 0;
  const parts = tokenizePattern(pattern).map(t => {
    key += 1;
    switch (t.kind) {
      case 'text':
        return t.value;
      case 'brace':
        return (
          <S.EscapedBrace key={key} disabled={disabled}>
            {t.value}
          </S.EscapedBrace>
        );
      case 'placeholder':
        return (
          <S.InflectionStem key={key} disabled={disabled}>
            {t.value}
          </S.InflectionStem>
        );
    }
  });

  // FIXME: Return the array as soon as TypeScript allows it.
  return <>{parts}</>;
});

InflectionPattern.displayName = 'InflectionPattern';

export default InflectionPattern;
