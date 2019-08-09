import React, {ReactNode, Ref, RefObject} from 'react';

import Placement from '../placement';

import {useStack} from './context';
import ManagedMenu from './managed-menu';
import Item from './item';
import CheckItem from './check-item';
import Separator from './separator';

export interface Props {
  id?: string;
  name?: string;
  placement?: Placement;
  parentRef?: RefObject<Element>;
  children: ReactNode;
}

export type MenuElement = JSX.Element & {
  ref?: Ref<ManagedMenu>;
};

export type MenuRef = Ref<ManagedMenu>;

export type MenuType = ManagedMenu;

export const Menu = Object.assign(
  // eslint-disable-next-line react/display-name
  React.forwardRef<ManagedMenu, Props>((
    props: Props,
    ref
  ) => {
    const {
      children,
      placement = Placement.BELOW_LEFT,
      parentRef,
      ...otherProps
    } = props;

    if (!parentRef) {
      throw new Error('Menu must be mounted with a parentRef. Use a MenuTrigger to assign it automatically.');
    }

    const stack = useStack();
    return (
      <ManagedMenu
        {...otherProps}
        placement={placement}
        parentRef={parentRef}
        stack={stack}
        ref={ref}
      >
        {children}
      </ManagedMenu>
    );
  }),
  {
    Item,
    CheckItem,
    Separator,
  }
);

Menu.displayName = 'Menu';
