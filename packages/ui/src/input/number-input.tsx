import React, {InputHTMLAttributes} from 'react';

import * as S from './styles';

export type Props = {
  value?: string | number;
  children?: never;
} & Partial<Omit<S.Props, 'autoSize'>> & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'value' | 'type'
>;

export const NumberInput = React.forwardRef<HTMLInputElement, Props>((
  props: Props,
  ref
) => {
  const {
    step = 1,
    minimal = false,
    ...otherProps
  } = props;

  return (
    <S.Input
      {...otherProps}
      type='number'
      step={step}
      minimal={minimal}
      ref={ref}
    />
  );
});

NumberInput.displayName = 'NumberInput';
