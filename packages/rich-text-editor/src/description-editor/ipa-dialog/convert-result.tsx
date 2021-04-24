import React, {Ref} from 'react';

import * as S from './styles';

export type Props = {
  id: string;
  ipa: string;
  index: number;
  selected: boolean;
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
      <S.ConvertText>Convert to IPA</S.ConvertText>
    </S.Result>
  );
}));

ConvertResult.displayName = 'ConvertResult';

export default ConvertResult;
