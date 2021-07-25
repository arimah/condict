import React, {Ref} from 'react';

import {Messages} from '../types';
import * as S from './styles';

export type Props = {
  id: string;
  ipa: string;
  index: number;
  selected: boolean;
  messages: Messages;
  onMouseEnter: (index: number) => void;
  onClick: (ipa: string) => void;
};

const ConvertResult = React.memo(React.forwardRef((
  props: Props,
  ref: Ref<HTMLElement>
): JSX.Element => {
  const {
    id,
    ipa,
    index,
    selected,
    messages,
    onMouseEnter,
    onClick,
  } = props;

  return (
    <S.Result
      id={id}
      selected={selected}
      aria-selected={selected}
      onMouseEnter={() => onMouseEnter(index)}
      onClick={() => onClick(ipa)}
      ref={ref as Ref<HTMLDivElement>}
    >
      <S.TargetIpa>{ipa}</S.TargetIpa>
      <S.ConvertText>{messages.convertToIpa()}</S.ConvertText>
    </S.Result>
  );
}));

ConvertResult.displayName = 'ConvertResult';

export default ConvertResult;
