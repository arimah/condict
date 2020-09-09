import React, {ReactNode, Ref, RefObject, useContext} from 'react';

import Placement, {RelativeParent} from '../placement';

import {ManagedTreeContext} from './context';
import ManagedMenu from './managed-menu';
import MenuManager from './manager';
import Item from './item';
import CheckItem from './check-item';
import Separator from './separator';

export type Props = {
  id?: string;
  name?: string;
  placement?: Placement;
  parentRef?: RefObject<RelativeParent>;
  onClose?: () => void;
  children: ReactNode;
};

export type MenuElement = JSX.Element & {
  ref?: Ref<ManagedMenu>;
};

export type MenuType = ManagedMenu;

const Menu = Object.assign(
  // eslint-disable-next-line react/display-name
  React.forwardRef((
    props: Props,
    ref: Ref<ManagedMenu>
  ) => {
    const {
      children,
      placement = 'BELOW_LEFT',
      parentRef,
      ...otherProps
    } = props;

    if (!parentRef) {
      throw new Error('Menu must be mounted with a parentRef. Use a MenuTrigger to assign it automatically.');
    }

    const tree = useContext(ManagedTreeContext);
    if (tree) {
      return (
        <ManagedMenu
          {...otherProps}
          placement={placement}
          parentRef={parentRef}
          stack={tree.stack}
          manager={tree.manager}
          ref={ref}
        >
          {children}
        </ManagedMenu>
      );
    } else {
      return (
        <MenuManager>
          <Menu
            {...otherProps}
            placement={placement}
            parentRef={parentRef}
            ref={ref}
          >
            {children}
          </Menu>
        </MenuManager>
      );
    }
  }),
  {
    Item,
    CheckItem,
    Separator,
  }
);

Menu.displayName = 'Menu';

export default Menu;
