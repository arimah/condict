import React, {Ref, InputHTMLAttributes} from 'react';

import * as S from './styles';

export type Props = {
  value?: string | number;
  children?: never;
} & Partial<S.Props> & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'value' | 'type'
>;

export const NumberInput = React.forwardRef((
  props: Props,
  ref: Ref<HTMLInputElement>
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
