import React, {Ref, KeyboardEventHandler, useRef} from 'react';

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

export type Props = {
  label?: string;
} & Omit<SelectProps, 'minimal' | 'onKeyDown' | 'tabIndex'>;

const Select = React.forwardRef((props: Props, ref: Ref<HTMLSelectElement>) => {
  const {label, children, ...otherProps} = props;

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
      >
        {children}
      </RegularSelect>
    </S.SelectLabel>
  );
});

Select.displayName = 'Select';

export default Select;
