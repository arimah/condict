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

const ContextMenuTrigger = (props: Props): JSX.Element => {
  const {
    menu,
    openClass,
    onToggle,
    children,
  } = props;

  const menuId = useUniqueId();
  const [isOpen, setOpen] = useState(false);
  const ownerRef = useRef<MenuOwnerHandle>(null);
  const childRef = useRef<ChildType>(null);
  const openMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();

    // Before the menu is open, we need to make sure there is a valid parent
    // to place the menu relative to. This event can be triggered either by
    // pointer (right-clicking, usually), or by pressing the menu key on the
    // keyboard. If you use the keyboard, then the menu is placed relative to
    // the trigger element; otherwise, it is placed at the pointer.
    const parent = e.button === 0 && childRef.current
      // No mouse button pressed - place relative to child element
      ? childRef.current
      // Mouse button pressed or child ref empty - place relative to mouse.
      : { x: e.clientX, y: e.clientY };

    if (ownerRef.current) {
      ownerRef.current.open({
        name: null,
        parent,
        fromKeyboard: e.button === 0,
      });
      setOpen(true);
      onToggle?.(true);
    }
  }, [onToggle]);
  const handleClose = useCallback(() => {
    childRef.current?.focus();
    setOpen(false);
    onToggle?.(false);
  }, [onToggle]);

  const menuWithExtra = React.cloneElement(menu, {id: menuId});
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const childClassName = children.props?.className as string | undefined;
  const childWithMenu = React.cloneElement(children, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    'aria-owns': `${menuId} ${children.props['aria-owns'] ?? ''}`,
    className: isOpen && openClass
      ? `${childClassName ?? ''} ${openClass}`
      : childClassName,
    onContextMenu: openMenu,
    ref: combineRefs(childRef, children.ref),
  });

  return <>
    {childWithMenu}
    <MenuOwner onCloseRoot={handleClose} ref={ownerRef}>
      {menuWithExtra}
    </MenuOwner>
  </>;
};

export default ContextMenuTrigger;
