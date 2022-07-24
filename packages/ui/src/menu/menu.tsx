import React, {ReactNode, Ref, useContext} from 'react';

import {OwnerContext} from './context';
import OwnedMenu, {MenuHandle} from './owned-menu';
import MenuOwner from './owner';
import Item from './item';
import CheckItem from './check-item';
import Separator from './separator';

export type Props = {
  name?: string;
  id?: string;
  label?: string;
  onClose?: () => void;
  children?: ReactNode;
};

const Menu = React.forwardRef((props: Props, ref: Ref<MenuHandle>) => {
  const {children, ...otherProps} = props;

  const owner = useContext(OwnerContext);

  const ownedMenu =
    <OwnedMenu {...otherProps} parentItem={null} publicRef={ref}>
      {children}
    </OwnedMenu>;

  if (owner) {
    return ownedMenu;
  } else {
    return <MenuOwner>{ownedMenu}</MenuOwner>;
  }
});

Menu.displayName = 'Menu';

export default Object.assign(Menu, {
  Item,
  CheckItem,
  Separator,
});
