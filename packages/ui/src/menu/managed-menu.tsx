import React, {Component, ReactNode, RefObject} from 'react';
import ReactDOM from 'react-dom';
import memoizeOne from 'memoize-one';

import DescendantCollection from '../descendant-collection';
import Placement, {RelativeParent, placeElement} from '../placement';

import * as S from './styles';
import {MenuStack} from './menu-stack';
import {MenuContext, MenuContextValue, MenuItem} from './context';
import MenuManager from './manager';
import EventSink from './event-sink';
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

const getSubmenuPlacement = (ownPlacement: Placement) => {
  // The basic idea: keep growing in the same horizontal direction.
  switch (ownPlacement) {
    case 'BELOW_LEFT':
    case 'ABOVE_LEFT':
    case 'RIGHT_TOP':
    case 'RIGHT_BOTTOM':
      return 'RIGHT_TOP';
    case 'BELOW_RIGHT':
    case 'ABOVE_RIGHT':
    case 'LEFT_TOP':
    case 'LEFT_BOTTOM':
    default:
      return 'LEFT_TOP';
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
  private needFocus = false;

  public contains(elem: Node | null): boolean {
    return (
      this.menuRef.current !== null &&
      this.menuRef.current.contains(elem)
    );
  }

  public componentDidUpdate(prevProps: Readonly<Props>): void {
    const nextProps = this.props;
    if (prevProps.stack !== nextProps.stack) {
      const prevOpen = MenuStack.isMenuOpen(prevProps.stack, this);
      const nextOpen = MenuStack.isMenuOpen(nextProps.stack, this);

      if (!prevOpen && nextOpen) {
        this.attachEvents();
      } else if (prevOpen && !nextOpen) {
        this.detachEvents();
      }
      // Move keyboard focus when it is the deepest menu.
      // This is done *after* the menu has been placed, to prevent
      // unpleasant jumping around.
      this.needFocus = MenuStack.isDeepestMenu(nextProps.stack, this);
    }

    this.updatePlacement();
  }

  public componentWillUnmount(): void {
    this.detachEvents();
  }

  public open(fromKeyboard: boolean): void {
    this.props.manager.open(this, fromKeyboard);
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

    if (MenuStack.isMenuOpen(this.props.stack, this)) {
      const menu = this.menuRef.current;
      const {placement} = this.props;

      placeElement(menu, parentRef.current, placement);

      if (this.needFocus) {
        menu.focus();
        this.needFocus = false;
      }
    }
  });

  public render(): JSX.Element {
    const {id, name, placement, stack, children} = this.props;

    const open = MenuStack.isMenuOpen(stack, this);
    const depth = MenuStack.getDepth(stack, this);
    const currentChild = MenuStack.getFocusedItem(stack, this);
    const contextValue = this.getMenuContextValue(
      this.items,
      currentChild,
      getSubmenuPlacement(placement)
    );

    // Menu trees can get large and complex, so we should only mount children
    // when they are needed. We only need children when the menu is open.

    const menu =
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
      </S.Menu>;

    return ReactDOM.createPortal(
      // If this is the root menu, we must install an EventSink around it,
      // to ensure synthetic events don't escape the menu system.
      MenuStack.isRootMenu(stack, this)
        ? <EventSink>{menu}</EventSink>
        : menu,
      getContainer()
    );
  }
}

export default ManagedMenu;
