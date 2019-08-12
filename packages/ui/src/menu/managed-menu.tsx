import React, {Component, ReactNode, RefObject} from 'react';
import ReactDOM from 'react-dom';
import memoizeOne from 'memoize-one';

import DescendantCollection from '../descendant-collection';
import Placement, {RelativeParent, placeElement} from '../placement';

import * as S from './styles';
import MenuStack from './menu-stack';
import {MenuContext, MenuContextValue, MenuItem} from './context';
import MenuManager from './manager';
import getContainer from './container';

const getMenuContextValue = (
  items: DescendantCollection<MenuItem, HTMLElement>,
  currentFocus: MenuItem | null,
  submenuPlacement: Placement
): MenuContextValue => ({
  items,
  currentFocus,
  submenuPlacement,
});

const inRaf = (fn: () => void) => {
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

const getDepth = (stack: MenuStack, menu: ManagedMenu) => {
  return stack.openMenus.findIndex(m => m.menu === menu);
};

const isMenuOpen = (stack: MenuStack, menu: ManagedMenu) => {
  return stack.openMenus.some(m => m.menu === menu);
};

const isDeepestMenu = (stack: MenuStack, menu: ManagedMenu) => {
  const {openMenus} = stack;
  return (
    openMenus.length > 0 &&
    openMenus[openMenus.length - 1].menu === menu
  );
};

const getFocusedItem = (stack: MenuStack, menu: ManagedMenu) => {
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

const getSubmenuPlacement = (ownPlacement: Placement) => {
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

export type Props = {
  id?: string;
  name?: string;
  placement: Placement;
  parentRef: RefObject<RelativeParent>;
  stack: MenuStack;
  manager: MenuManager;
  onClose?: () => void; // called by the MenuManager
  children: ReactNode;
};

class ManagedMenu extends Component<Props> {
  public readonly items = new DescendantCollection<MenuItem, HTMLElement>(item => item.self);
  private readonly menuRef = React.createRef<HTMLDivElement>();
  private readonly getMenuContextValue = memoizeOne(getMenuContextValue);
  private needFocus: boolean = false;

  public contains(elem: Node | null) {
    return (
      this.menuRef.current &&
      this.menuRef.current.contains(elem)
    );
  }

  public componentDidUpdate(prevProps: Readonly<Props>) {
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

  public componentWillUnmount() {
    this.detachEvents();
  }

  public open() {
    this.props.manager.open(this);
  }

  private attachEvents() {
    window.addEventListener('scroll', this.updatePlacement);
    window.addEventListener('resize', this.updatePlacement);
  }

  private detachEvents() {
    window.removeEventListener('scroll', this.updatePlacement);
    window.removeEventListener('resize', this.updatePlacement);
  }

  private updatePlacement = inRaf(() => {
    // Since this runs inside requestAnimationFrame, the component could
    // have become unmounted by the time we get here. If there is no
    // menu or no parent, we can't place the element, so just bail out.
    const {parentRef} = this.props;
    if (!this.menuRef.current || !parentRef.current) {
      return;
    }

    if (isMenuOpen(this.props.stack, this)) {
      const menu = this.menuRef.current;
      const {placement} = this.props;

      placeElement(menu, parentRef.current, placement);

      if (this.needFocus) {
        menu.focus();
        this.needFocus = false;
      }
    }
  });

  public render() {
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

export default ManagedMenu;
