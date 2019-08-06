import React, {
  Ref,
  RefAttributes,
  useState,
  useRef,
  useCallback,
} from 'react';

import genId from '@condict/gen-id';

import combineRefs from '../combine-refs';

import {Menu, Props as MenuProps} from '.';
import MenuManager from './manager';
import ManagedMenu from './managed-menu';

export interface Props {
  menu: JSX.Element & {
    ref?: Ref<ManagedMenu>;
  };
  onToggle: (open: boolean) => void;
  children: JSX.Element & {
    ref?: Ref<ChildType>;
  };
}

export interface ChildType {
  focus: () => void;
}

const MenuTrigger = (props: Props) => {
  const {menu, onToggle, children} = props;

  const [menuId] = useState(genId);
  const menuRef = useRef<ManagedMenu>(null);
  const childRef = useRef<ChildType>(null);
  const managerRef = useRef<MenuManager>(null);
  const openMenu = useCallback(() => {
    if (managerRef.current && menuRef.current) {
      managerRef.current.open(menuRef.current);
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

  const x = <Menu id='rawr' parentRef={{current: null}}/>;

  return <>
    {childWithMenu}
    <MenuManager onClose={handleClose} ref={managerRef}>
      {menuWithExtra}
    </MenuManager>
  </>;
};

MenuTrigger.defaultProps = {
  onToggle: () => { },
};

export default MenuTrigger;
