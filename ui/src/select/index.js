import React from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

const renderOptions = (children, options) => {
  if (process.env.NODE_ENV === 'development' && children && options) {
    // eslint-disable-next-line no-console
    console.warn(
      '<Select> should have either children or options, not both! Children will take precedence.'
    );
    // eslint-disable-next-line no-console
    console.trace();
  }

  if (children) {
    return children;
  }
  if (options) {
    return options.map(opt =>
      <option key={opt.value} value={opt.value}>
        {opt.name}
      </option>
    );
  }

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      '<Select> has no children. This can have negative usability and accessibility implications.'
    );
    // eslint-disable-next-line no-console
    console.trace();
  }
  return null;
};

export const Select = React.forwardRef((props, ref) => {
  const {
    className,
    value,
    options,
    minimal,
    disabled,
    borderRadius,
    children,
    onChange,
    ...otherProps
  } = props;

  return (
    <S.Wrapper className={className}>
      <S.Select
        {...otherProps}
        value={value}
        minimal={minimal}
        disabled={disabled}
        borderRadius={borderRadius}
        onChange={onChange}
        ref={ref}
      >
        {renderOptions(children, options)}
      </S.Select>
      <S.Arrow disabled={disabled}>
        <path d='M0 2 H8 L4 8 Z' fill='currentColor'/>
      </S.Arrow>
    </S.Wrapper>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired),
  minimal: PropTypes.bool,
  disabled: PropTypes.bool,
  borderRadius: PropTypes.string,
  children: PropTypes.node,
  onChange: PropTypes.func,
};

Select.defaultProps = {
  className: '',
  value: '',
  options: null,
  minimal: false,
  disabled: false,
  borderRadius: undefined,
  children: null,
  onChange: () => {},
};
