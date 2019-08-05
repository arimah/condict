import React, {InputHTMLAttributes, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import autoSizeInput from 'autosize-input';

import combineRefs from '../combine-refs';

import * as S from './styles';

// TextInput.propTypes = {
//   minimal: PropTypes.bool,
//   autoSize: PropTypes.bool,
//   borderRadius: PropTypes.string,
//   inputRef: PropTypes.oneOfType([
//     PropTypes.func,
//     PropTypes.shape({current: PropTypes.any}),
//   ]),
//   onChange: PropTypes.func,
// };

export type Props = {
  value: string;
  type: 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';
} & S.Props & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'value' | 'type'
>;

export const TextInput = React.forwardRef<HTMLInputElement, Props>((
  props: Props,
  ref
) => {
  const {
    type,
    minimal,
    autoSize,
    borderRadius,
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
      borderRadius={borderRadius}
      ref={combineRefs(inputRef, ref)}
    />
  );
});

TextInput.displayName = 'TextInput';

TextInput.defaultProps = {
  type: 'text',
  value: '',
  minimal: false,
  autoSize: false,
  borderRadius: undefined,
};
