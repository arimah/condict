import React, {Ref} from 'react';

import * as S from './styles';

export type Props = {
  className?: string;
  size?: number;
};

export const Spinner = React.forwardRef((
  props: Props,
  ref: Ref<HTMLSpanElement>
) => {
  const {className, size = 24} = props;

  const sliceStyle = {
    borderWidth: Math.ceil(Math.min(25, size / 8)),
  };

  return (
    <S.Main
      className={className}
      style={{width: size, height: size}}
      ref={ref}
    >
      <S.Slice style={sliceStyle} $n={0}/>
      <S.Slice style={sliceStyle} $n={1}/>
      <S.Slice style={sliceStyle} $n={2}/>
    </S.Main>
  );
});

Spinner.displayName = 'Spinner';
