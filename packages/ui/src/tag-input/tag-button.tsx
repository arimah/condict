import React, {MouseEventHandler, useRef, useState, useEffect} from 'react';

import {Descendants, TagInputChild} from './types';
import * as S from './styles';

export type Props = {
  tag: string;
  disabled: boolean | undefined;
  isSelected: boolean;
  parentItems: Descendants;
  'aria-describedby': string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

const TagButton = React.memo((props: Props) => {
  const {
    tag,
    disabled,
    isSelected,
    parentItems,
    'aria-describedby': ariaDescribedBy,
    onClick,
  } = props;

  const elemRef = useRef<HTMLButtonElement>(null);
  const [item] = useState(() => new TagInputChild(elemRef, tag));
  parentItems.register(item);
  useEffect(() => () => parentItems.unregister(item), []);

  return (
    <S.Tag
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      tabIndex={isSelected ? 0 : -1}
      onClick={onClick}
      ref={elemRef}
    >
      {tag}
      {!disabled && <S.DeleteMarker/>}
    </S.Tag>
  );
});

TagButton.displayName = 'TagButton';

export default TagButton;
