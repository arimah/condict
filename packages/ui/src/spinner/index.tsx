import React from 'react';

import * as S from './styles';

export type Props = {
  className?: string;
  size?: number;
};

export const Spinner = React.forwardRef<HTMLSpanElement, Props>((
  props: Props,
  ref
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
      <S.Slice style={sliceStyle} number={0}/>
      <S.Slice style={sliceStyle} number={1}/>
      <S.Slice style={sliceStyle} number={2}/>
    </S.Main>
  );
});

Spinner.displayName = 'Spinner';
