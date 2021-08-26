import React, {Ref, ButtonHTMLAttributes, useRef} from 'react';

import {MenuElement, MenuTrigger} from '../menu';
import {getContentAndLabel} from '../a11y-utils';
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

const MenuButton = React.forwardRef((
  props: Props,
  ref: Ref<HTMLButtonElement>
) => {
  const {
    label = '',
    menu,
    children,
    ...otherProps
  } = props;

  const ownRef = useRef<HTMLButtonElement>(null);
  const isCurrent = useManagedFocus(ownRef);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <MenuTrigger menu={menu}>
      <S.Button
        {...otherProps}
        aria-label={ariaLabel}
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
