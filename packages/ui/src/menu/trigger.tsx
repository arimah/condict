import React, {Ref, useState, useRef, useCallback} from 'react';

import combineRefs from '../combine-refs';
import {RelativeParent} from '../placement';
import {useUniqueId} from '../unique-id';

import {MenuElement} from '.';
import MenuManager from './manager';
import ManagedMenu from './managed-menu';

export type Props = {
  menu: MenuElement;
  openClass?: string;
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
    openClass = 'menu-open',
    onToggle = DefaultOnToggle,
    children,
  } = props;

  const menuId = useUniqueId();
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<ManagedMenu>(null);
  const childRef = useRef<ChildType>(null);
  const openMenu = useCallback(() => {
    if (menuRef.current) {
      // TODO: See if we can distinguish between mouse and keyboard clicks
      // in this event.
      menuRef.current.open(false);
      setOpen(true);
      onToggle(true);
    }
  }, [onToggle]);
  const handleClose = useCallback(() => {
    if (childRef.current) {
      childRef.current.focus();
    }
    setOpen(false);
    onToggle(false);
  }, [onToggle]);

  const menuWithExtra = React.cloneElement(menu, {
    id: menuId,
    parentRef: childRef,
    ref: combineRefs(menuRef, menu.ref),
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const childClassName = children.props?.className as string | undefined;
  const childWithMenu = React.cloneElement(children, {
    'aria-owns': menuId,
    'aria-haspopup': 'menu',
    className: isOpen && openClass
      ? `${childClassName || ''} ${openClass}`
      : childClassName,
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
