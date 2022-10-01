import React, {MouseEvent, Ref, useState, useRef, useCallback} from 'react';

import combineRefs from '../combine-refs';
import {useUniqueId} from '../unique-id';

import MenuOwner, {MenuOwnerHandle} from './owner';
import {MenuParent} from './types';

export type Props = {
  menu: JSX.Element;
  openClass?: string;
  onToggle?: (open: boolean) => void;
  children: JSX.Element & {
    ref?: Ref<ChildType>;
  };
};

export type ChildType = MenuParent & {
  focus: () => void;
};

const MenuTrigger = (props: Props): JSX.Element => {
  const {
    menu,
    openClass = 'menu-open',
    onToggle,
    children,
  } = props;

  const menuId = useUniqueId();
  const [isOpen, setOpen] = useState(false);
  const ownerRef = useRef<MenuOwnerHandle>(null);
  const childRef = useRef<ChildType>(null);
  const openMenu = useCallback(() => {
    if (ownerRef.current && childRef.current) {
      // TODO: See if we can distinguish between mouse and keyboard clicks
      // in this event.
      ownerRef.current.open({
        name: null,
        parent: childRef.current,
      });
      setOpen(true);
      onToggle?.(true);
    }
  }, [onToggle]);
  const handleClose = useCallback(() => {
    if (childRef.current) {
      childRef.current.focus();
    }
    setOpen(false);
    onToggle?.(false);
  }, [onToggle]);

  const menuWithExtra = React.cloneElement(menu, {id: menuId});
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const childClassName = children.props?.className as string | undefined;
  const childWithMenu = React.cloneElement(children, {
    'aria-owns': menuId,
    'aria-haspopup': 'menu',
    className: isOpen && openClass
      ? `${childClassName ?? ''} ${openClass}`
      : childClassName,
    onClick: openMenu,
    ref: combineRefs(childRef, children.ref),
  });

  return <>
    {childWithMenu}
    <MenuOwner onCloseRoot={handleClose} ref={ownerRef}>
      {menuWithExtra}
    </MenuOwner>
  </>;
};

export default MenuTrigger;
