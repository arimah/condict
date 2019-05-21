import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';

import DescendantCollection from '../descendant-collection';
import Placement, {placeElement} from '../placement';

import * as S from './styles';
import {MenuStack} from './manager';
import {MenuContext} from './context';
import getContainer from './container';

const getMenuContextValue = (items, currentFocus, submenuPlacement) => ({
  items,
  currentFocus,
  submenuPlacement,
});

const inRaf = fn => {
  let updateQueued = false;
  return () => {
    if (!updateQueued) {
      updateQueued = true;
      window.requestAnimationFrame(() => {
        updateQueued = false;

        fn();
      });
    }
  };
};

const getDepth = (stack, menu) => {
  return stack.openMenus.findIndex(m => m.menu === menu);
};

const isMenuOpen = (stack, menu) => {
  return stack.openMenus.some(m => m.menu === menu);
};

const isDeepestMenu = (stack, menu) => {
  const {openMenus} = stack;
  return (
    openMenus.length > 0 &&
    openMenus[openMenus.length - 1].menu === menu
  );
};

const getFocusedItem = (stack, menu) => {
  const {openMenus, currentFocus} = stack;
  // If the currently hovered item is within this menu, it always has focus,
  // even if there is an open submenu.
  if (currentFocus && menu.contains(currentFocus.self)) {
    return currentFocus;
  }

  // The last open menu cannot have an open submenu: if it did, it wouldn't
  // be the last open menu.
  for (let i = 0; i < openMenus.length - 1; i++) {
    if (openMenus[i].menu === menu) {
      return openMenus[i + 1].parentItem;
    }
  }
  return null;
};

const getSubmenuPlacement = ownPlacement => {
  // The basic idea: keep growing in the same horizontal direction.
  switch (ownPlacement) {
    case Placement.BELOW_LEFT:
    case Placement.ABOVE_LEFT:
    case Placement.RIGHT_TOP:
    case Placement.RIGHT_BOTTOM:
      return Placement.RIGHT_TOP;
    case Placement.BELOW_RIGHT:
    case Placement.ABOVE_RIGHT:
    case Placement.LEFT_TOP:
    case Placement.LEFT_BOTTOM:
    default:
      return Placement.LEFT_TOP;
  }
};

class ManagedMenu extends Component {
  constructor(props) {
    super(props);

    this.items = new DescendantCollection(item => item.self);
    this.menuRef = React.createRef();
    this.getMenuContextValue = memoizeOne(getMenuContextValue);
    this.updatePlacement = inRaf(this.updatePlacement.bind(this));
  }

  contains(elem) {
    return (
      this.menuRef.current &&
      this.menuRef.current.contains(elem)
    );
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props;
    if (prevProps.stack !== nextProps.stack) {
      const prevOpen = isMenuOpen(prevProps.stack, this);
      const nextOpen = isMenuOpen(nextProps.stack, this);

      if (!prevOpen && nextOpen) {
        this.attachEvents();
      } else if (prevOpen && !nextOpen) {
        this.detachEvents();
      }
      // Move keyboard focus when it is the deepest menu.
      // This is done *after* the menu has been placed, to prevent
      // unpleasant jumping around.
      this.needFocus = isDeepestMenu(nextProps.stack, this);
    }

    this.updatePlacement();
  }

  componentWillUnmount() {
    this.detachEvents();
  }

  attachEvents() {
    window.addEventListener('scroll', this.updatePlacement);
    window.addEventListener('resize', this.updatePlacement);
  }

  detachEvents() {
    window.removeEventListener('scroll', this.updatePlacement);
    window.removeEventListener('resize', this.updatePlacement);
  }

  updatePlacement() {
    // Since this runs inside requestAnimationFrame, the component could
    // have become unmounted by the time we get here. If there is no
    // menu or no parent, we can't place the element, so just bail out.
    if (!this.menuRef.current || !this.props.parentRef.current) {
      return;
    }

    if (isMenuOpen(this.props.stack, this)) {
      const menu = this.menuRef.current;
      const {parentRef, placement} = this.props;

      placeElement(menu, parentRef.current, placement);

      if (this.needFocus) {
        menu.focus();
        this.needFocus = false;
      }
    }
  }

  render() {
    const {id, name, placement, stack, children} = this.props;

    const open = isMenuOpen(stack, this);
    const depth = getDepth(stack, this);
    const currentChild = getFocusedItem(stack, this);
    const contextValue = this.getMenuContextValue(
      this.items,
      currentChild,
      getSubmenuPlacement(placement)
    );

    // Menu trees can get large and complex, so we should only mount children
    // when they are needed. We only need children when the menu is open.

    return ReactDOM.createPortal(
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      <S.Menu
        id={id}
        aria-label={name}
        aria-activedescendant={currentChild ? currentChild.id : undefined}
        open={open}
        submenu={depth > 0}
        style={{zIndex: 100 + depth}}
        ref={this.menuRef}
      >
        {open &&
          <MenuContext.Provider value={contextValue}>
            {children}
          </MenuContext.Provider>
        }
      </S.Menu>,
      getContainer()
    );
  }
}

ManagedMenu.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  placement: PropTypes.oneOf(Object.values(Placement)).isRequired,
  parentRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
  stack: PropTypes.instanceOf(MenuStack).isRequired,
  children: PropTypes.any.isRequired,
};

export default ManagedMenu;
