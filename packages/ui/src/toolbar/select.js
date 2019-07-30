import React, {useRef} from 'react';
import PropTypes from 'prop-types';

import {Select as RegularSelect} from '../select';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';

const handleKeyDown = e => {
  // Override the toolbar's home/end keys, so we can use them
  // to navigate the dropdown's options.
  if (e.key === 'Home' || e.key === 'End') {
    e.stopPropagation();
  }
};

const Select = React.forwardRef((props, ref) => {
  const {label, children, ...otherProps} = props;

  const ownRef = useRef();
  const isCurrent = useManagedFocus(ownRef);

  return (
    <label>
      {label}
      <RegularSelect
        {...otherProps}
        minimal
        tabIndex={isCurrent ? 0 : -1}
        onKeyDown={handleKeyDown}
        ref={combineRefs(ref, ownRef)}
      >
        {children}
      </RegularSelect>
    </label>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

Select.defaultProps = {
  className: '',
  label: undefined,
  value: '',
  options: null,
  disabled: false,
  onChange: () => {},
  children: null,
};

export default Select;
