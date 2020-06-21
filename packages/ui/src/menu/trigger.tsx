import React, {
  Ref,
  useState,
  useRef,
  useCallback,
} from 'react';

import genId from '@condict/gen-id';

import combineRefs from '../combine-refs';
import {RelativeParent} from '../placement';

import {MenuElement} from '.';
import MenuManager from './manager';
import ManagedMenu from './managed-menu';

export type Props = {
  menu: MenuElement;
  onToggle?: (open: boolean) => void;
  children: JSX.Element & {
    ref?: Ref<ChildType>;
  };
};

export type ChildType = RelativeParent & {
  focus: () => void;
};

const DefaultOnToggle = () => { /* no-op */ };

const MenuTrigger = (props: Props): JSX.Element => {
  const {
    menu,
    onToggle = DefaultOnToggle,
    children,
  } = props;

  const [menuId] = useState(genId);
  const menuRef = useRef<ManagedMenu>(null);
  const childRef = useRef<ChildType>(null);
  const openMenu = useCallback(() => {
    if (menuRef.current) {
      // TODO: See if we can distinguish between mouse and keyboard clicks
      // in this event.
      menuRef.current.open(false);
      onToggle(true);
    }
  }, [onToggle]);
  const handleClose = useCallback(() => {
    if (childRef.current) {
      childRef.current.focus();
    }
    onToggle(false);
  }, [onToggle]);

  const menuWithExtra = React.cloneElement(menu, {
    id: menuId,
    parentRef: childRef,
    ref: combineRefs(menuRef, menu.ref),
  });
  const childWithMenu = React.cloneElement(children, {
    'aria-owns': menuId,
    'aria-haspopup': 'menu',
    onClick: openMenu,
    ref: combineRefs(childRef, children.ref),
  });

  return <>
    {childWithMenu}
    <MenuManager onClose={handleClose}>
      {menuWithExtra}
    </MenuManager>
  </>;
};

export default MenuTrigger;
