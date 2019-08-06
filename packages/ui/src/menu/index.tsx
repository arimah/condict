import React, {FunctionComponent, ReactNode, Ref, RefObject} from 'react';

import Placement from '../placement';

import {StackContext, useStack} from './context';
import ManagedMenu from './managed-menu';
import Item from './item';
import CheckItem from './check-item';
import Separator from './separator';

export interface Props {
  id?: string;
  name?: string;
  placement: Placement;
  parentRef: RefObject<Element>;
  children: ReactNode;
}

export type MenuElement = JSX.Element & {
  ref?: Ref<ManagedMenu>;
};

export const Menu = Object.assign(
  React.forwardRef<ManagedMenu, Props>((
    props: Props,
    ref
  ) => {
    const {children, ...otherProps} = props;
    const stack = useStack();
    return (
      <ManagedMenu {...otherProps} stack={stack} ref={ref}>
        {children}
      </ManagedMenu>
    );
  }),
  {
    Item,
    CheckItem,
    Separator,
    defaultProps: {
      placement: Placement.BELOW_LEFT,
    },
  }
);
Menu.displayName = 'Menu';

