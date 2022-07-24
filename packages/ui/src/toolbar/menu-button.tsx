import React, {Ref, ButtonHTMLAttributes, useRef} from 'react';

import {MenuTrigger} from '../menu';
import {getContentAndLabel} from '../a11y-utils';
import Placement from '../placement';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';
import formatTooltip from './format-tooltip';
import * as S from './styles';

export type Props = {
  label?: string;
  menu: JSX.Element;
  placement?: Placement;
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
    placement,
    children,
    ...otherProps
  } = props;

  const ownRef = useRef<HTMLButtonElement>(null);
  const isCurrent = useManagedFocus(ownRef);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <MenuTrigger menu={menu} placement={placement}>
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
