import React, {Ref} from 'react';

import {LinkTarget, LinkMessages} from '../../types';

import {SearchResult} from './types';
import * as S from './styles';

export type Props = {
  id: string;
  index: number;
  result: SearchResult;
  selected: boolean;
  messages: LinkMessages;
  onMouseEnter: (index: number) => void;
  onClick: (target: LinkTarget) => void;
};

const SearchResultItem = React.forwardRef((
  props: Props,
  ref: Ref<HTMLLIElement>
): JSX.Element => {
  const {id, index, result, selected, messages, onMouseEnter, onClick} = props;

  return (
    <S.SearchResult
      id={id}
      selected={selected}
      aria-selected={selected}
      onMouseEnter={() => onMouseEnter(index)}
      onClick={() => onClick(result.target)}
      ref={ref}
    >
      <S.SearchResultHeader>
        <S.SearchResultName>
          {result.name}
        </S.SearchResultName>
        <S.SearchResultType>
          {messages.linkTargetType(result.target.type)}
        </S.SearchResultType>
      </S.SearchResultHeader>
      {result.snippet &&
        <S.SearchResultMatch>{result.snippet}</S.SearchResultMatch>}
    </S.SearchResult>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;
