import React, {Ref, RefAttributes, KeyboardEventHandler, useRef} from 'react';

import {Select as RegularSelect, Props as SelectProps} from '../select';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';
import * as S from './styles';

const handleKeyDown: KeyboardEventHandler = e => {
  // Override the toolbar's home/end keys, so we can use them
  // to navigate the dropdown's options.
  if (e.key === 'Home' || e.key === 'End') {
    e.stopPropagation();
  }
};

export type Props<T> = {
  label?: string;
} & Omit<
  SelectProps<T>,
  'minimal' | 'onKeyDown' | 'tabIndex'
> & RefAttributes<HTMLSelectElement>;

type SelectComponent = <T>(props: Props<T>) => JSX.Element;

const Select = React.forwardRef(function<T>(
  props: Props<T>,
  ref: Ref<HTMLSelectElement>
) {
  const {label, ...otherProps} = props;

  const ownRef = useRef<HTMLSelectElement>(null);
  const isCurrent = useManagedFocus(ownRef);

  return (
    <S.SelectLabel>
      {label}
      <RegularSelect
        {...otherProps}
        minimal
        tabIndex={isCurrent ? 0 : -1}
        onKeyDown={handleKeyDown}
        ref={combineRefs(ref, ownRef)}
      />
    </S.SelectLabel>
  );
});

Select.displayName = 'Select';

export default Select as SelectComponent;
