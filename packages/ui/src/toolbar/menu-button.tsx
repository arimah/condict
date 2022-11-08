import React, {Ref, ButtonHTMLAttributes, useRef} from 'react';

import {MenuTrigger} from '../menu';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';
import * as S from './styles';

export type Props = {
  menu: JSX.Element;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'tabIndex' | 'type'
>;

const MenuButton = React.forwardRef((
  props: Props,
  ref: Ref<HTMLButtonElement>
) => {
  const {
    menu,
    'aria-label': ariaLabel,
    title = null,
    children,
    ...otherProps
  } = props;

  const ownRef = useRef<HTMLButtonElement>(null);
  const isCurrent = useManagedFocus(ownRef);

  return (
    <MenuTrigger menu={menu}>
      <S.Button
        {...otherProps}
        aria-label={ariaLabel ?? title ?? undefined}
        tabIndex={isCurrent ? 0 : -1}
        title={title || undefined}
        ref={combineRefs(ref, ownRef)}
      >
        {children}
      </S.Button>
    </MenuTrigger>
  );
});

MenuButton.displayName = 'MenuButton';

export default MenuButton;
