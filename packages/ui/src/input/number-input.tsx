import React, {InputHTMLAttributes} from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

export type Props = {
  value: string | number;
  children: never;
} & S.Props & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'value' | 'type'
>;

export const NumberInput = React.forwardRef<HTMLInputElement, Props>((
  props: Props,
  ref
) => {
  const {
    minimal,
    borderRadius,
    ...otherProps
  } = props;

  return (
    <S.Input
      {...otherProps}
      type='number'
      minimal={minimal}
      borderRadius={borderRadius}
      ref={ref}
    />
  );
});

NumberInput.displayName = 'NumberInput';

NumberInput.defaultProps = {
  value: '0',
  step: 1,
  minimal: false,
  borderRadius: undefined,
};
