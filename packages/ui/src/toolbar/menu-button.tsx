import React, {ButtonHTMLAttributes, useState, useRef} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import {MenuElement} from '../menu';
import MenuTrigger from '../menu/trigger';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';
import formatTooltip from './format-tooltip';
import * as S from './styles';

export type Props = {
  label?: string;
  menu: MenuElement;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'tabIndex' | 'title' | 'type'
>;

const MenuButton = React.forwardRef<HTMLButtonElement, Props>((
  props: Props,
  ref
) => {
  const {
    label = '',
    menu,
    children,
    ...otherProps
  } = props;

  const ownRef = useRef<HTMLButtonElement>(null);
  const isCurrent = useManagedFocus(ownRef);
  const [open, setOpen] = useState(false);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <MenuTrigger menu={menu} onToggle={setOpen}>
      <S.Button
        {...otherProps}
        aria-label={ariaLabel}
        menuOpen={open}
        tabIndex={isCurrent ? 0 : -1}
        title={formatTooltip(label, null)}
        ref={combineRefs(ref, ownRef)}
      >
        {renderedContent}
      </S.Button>
    </MenuTrigger>
  );
});

MenuButton.displayName = 'MenuButton';

export default MenuButton;
