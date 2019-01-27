import React from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

export const NumberInput = React.forwardRef((props, ref) => {
  const {
    className,
    value,
    placeholder,
    min,
    max,
    step,
    minimal,
    disabled,
    borderRadius,
    onChange,
    ...otherProps
  } = props;

  return (
    <S.Input
      {...otherProps}
      className={className}
      type='number'
      value={value}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      minimal={minimal}
      disabled={disabled}
      borderRadius={borderRadius}
      onChange={onChange}
      ref={ref}
    />
  );
});

NumberInput.displayName = 'NumberInput';

NumberInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  minimal: PropTypes.bool,
  disabled: PropTypes.bool,
  borderRadius: PropTypes.string,
  onChange: PropTypes.func,
};

NumberInput.defaultProps = {
  className: '',
  value: '0',
  placeholder: undefined,
  min: undefined,
  max: undefined,
  step: 1,
  minimal: false,
  disabled: false,
  borderRadius: undefined,
  onChange: () => {},
};
