import React, {InputHTMLAttributes, useRef, useEffect} from 'react';
import autoSizeInput from 'autosize-input';

import combineRefs from '../combine-refs';

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
    autoSize = false,
    ...otherProps
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoSize && inputRef.current) {
      const clearAutoSize = autoSizeInput(inputRef.current);
      return () => {
        clearAutoSize();
        if (inputRef.current) {
          inputRef.current.style.width = '';
        }
      };
    }
    return undefined;
  }, [autoSize]);

  return (
    <S.Input
      {...otherProps}
      type={type}
      minimal={minimal}
      autoSize={autoSize}
      ref={combineRefs(inputRef, ref)}
    />
  );
});

TextInput.displayName = 'TextInput';
