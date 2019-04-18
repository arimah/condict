import React, {useState, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';

import genId from '@condict/gen-id';

import combineRefs from '../combine-refs';

import MenuManager from './manager';

const MenuTrigger = props => {
  const {menu, children} = props;

  const [menuId] = useState(genId);
  const menuRef = useRef();
  const childRef = useRef();
  const managerRef = useRef();
  const openMenu = useCallback(() => {
    managerRef.current.open(menuRef.current);
  });
  const handleClose = useCallback(() => {
    childRef.current.focus();
  });

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
    <MenuManager onClose={handleClose} ref={managerRef}>
      {menuWithExtra}
    </MenuManager>
  </>;
};

MenuTrigger.propTypes = {
  menu: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired,
};

export default MenuTrigger;
