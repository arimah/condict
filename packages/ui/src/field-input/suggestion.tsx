import React from 'react';

import * as S from './styles';

export type Props<T> = {
  index: number;
  value: T;
  selected: boolean;
  singleSelect: boolean;
  focused: boolean;
  getName: (value: T) => string;
  getTag: (value: T) => string | null | undefined;
  parentId: string;
  onClick: (value: T) => void;
  onHover: (index: number) => void;
};

function Suggestion<T>(props: Props<T>): JSX.Element {
  const {
    index,
    value,
    selected,
    singleSelect,
    focused,
    getName,
    getTag,
    parentId,
    onClick,
    onHover,
  } = props;
  const tag = getTag(value);
  return (
    <S.Suggestion
      id={`${parentId}-${index}`}
      $focused={focused}
      onClick={() => onClick(value)}
      onMouseEnter={() => onHover(index)}
    >
      <S.ItemMarker $selected={selected} $single={singleSelect}/>
      <S.ItemName>{getName(value)}</S.ItemName>
      {tag && <S.ItemTag>{tag}</S.ItemTag>}
    </S.Suggestion>
  );
}

const MemoSuggestion = React.memo(Suggestion);

MemoSuggestion.displayName = 'Suggestion';

export default MemoSuggestion as typeof Suggestion;
