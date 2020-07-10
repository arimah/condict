import React, {InputHTMLAttributes} from 'react';

import * as S from './styles';

export type Type = 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';

export type Props = {
  value?: string;
  type?: Type;
  children?: never;
} & Partial<S.Props> & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'value' | 'type'
>;

export const TextInput = React.forwardRef<HTMLInputElement, Props>((
  props: Props,
  ref
) => {
  const {
    type = 'text',
    minimal = false,
    ...otherProps
  } = props;

  return (
    <S.Input
      {...otherProps}
      type={type}
      minimal={minimal}
      ref={ref}
    />
  );
});

TextInput.displayName = 'TextInput';
