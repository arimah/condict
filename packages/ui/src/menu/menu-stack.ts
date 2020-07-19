import DescendantCollection from '../descendant-collection';

import {MenuItem} from './context';
import ManagedMenu from './managed-menu';
import MenuManager from './manager';

const nextTick = (fn: () => void) => window.setTimeout(() => fn(), 0);

// Represents an open menu. The value contains the menu itself (a ManagedMenu)
// and the item (as a MenuItem, from ./context) that opened it.
class OpenMenu {
  public readonly menu: ManagedMenu;
  public readonly parentItem: MenuItem | null;

  public constructor(menu: ManagedMenu, parentItem: MenuItem | null) {
    this.menu = menu;
    this.parentItem = parentItem;
  }

  public elemToItem(elem: Element) {
    return this.menu.items.find(
      item => item.self.contains(elem)
    ) || null;
  }

  public filterItems(pred: (item: MenuItem) => boolean): MenuItem[] {
    return this.menu.items.filter(pred);
  }
}

// Contains the current state of the menu tree. It contains the currently open
// menus, and the currently hovered menu item. It exposes various methods for
// manipulating the menu stack.
//
// It's called a "stack" because it only deals with the set of open menus
// (which is indeed a stack), and not the whole menu tree.
export interface MenuStack {
  readonly openMenus: readonly OpenMenu[];
  readonly currentFocus: MenuItem | null;
}

export const MenuStack = {
  setCurrentFocus(stack: MenuStack, currentFocus: MenuItem | null): MenuStack {
    if (stack.currentFocus === currentFocus) {
      // No change
      return stack;
    }

    return {...stack, currentFocus};
  },

  setOpenMenus(stack: MenuStack, openMenus: readonly OpenMenu[]): MenuStack {
    return {...stack, openMenus};
  },

  moveFocus(
    stack: MenuStack,
    cb: (
      items: DescendantCollection<MenuItem, HTMLElement>,
      current: MenuItem | null
    ) => MenuItem | null
  ): MenuStack {
    const {openMenus, currentFocus} = stack;
    const currentMenu = openMenus[openMenus.length - 1];
    return {
      openMenus,
      currentFocus: cb(currentMenu.menu.items, currentFocus),
    };
  },

  openRoot(menu: ManagedMenu): MenuStack {
    return {
      openMenus: [new OpenMenu(menu, null)],
      currentFocus: null,
    };
  },

  openSubmenu(stack: MenuStack, parentItem: MenuItem): MenuStack {
    // First, let's find which menu the item belongs to.
    const {openMenus} = stack;
    const parentMenuIndex = openMenus.findIndex(
      m => m.menu.contains(parentItem.self)
    );
    if (parentMenuIndex === -1) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Cannot open an item that is not in the current stack:', {
          item: parentItem,
          stack,
        });
      }
      return stack;
    }
    if (!parentItem.submenu) {
      return stack;
    }

    // Close every menu that's deeper in the stack than the item's parent menu,
    // then open the new submenu underneath the parent menu.
    const newOpenMenus = openMenus.slice(0, parentMenuIndex + 1);
    newOpenMenus.push(new OpenMenu(parentItem.submenu, parentItem));
    return {...stack, openMenus: newOpenMenus};
  },

  activateCurrent(stack: MenuStack, manager: MenuManager): MenuStack {
    const {currentFocus} = stack;
    if (currentFocus && !currentFocus.disabled) {
      if (currentFocus.submenu) {
        return MenuStack.openSubmenu(stack, currentFocus);
      } else {
        nextTick(currentFocus.onActivate);
        manager.addPhantom(currentFocus);
        return EmptyStack;
      }
    }
    return stack;
  },

  closeOne(stack: MenuStack): MenuStack {
    const {openMenus} = stack;
    const currentMenu = openMenus[openMenus.length - 1];
    return {
      openMenus: openMenus.slice(0, -1),
      currentFocus: currentMenu.parentItem,
    };
  },

  closeUpTo(stack: MenuStack, openMenu: OpenMenu): MenuStack {
    const {openMenus} = stack;
    const index = openMenus.indexOf(openMenu);
    return {
      openMenus: openMenus.slice(0, index + 1),
      currentFocus: stack.currentFocus, // TODO: Does this make sense?
    };
  },

  getDepth(stack: MenuStack, menu: ManagedMenu): number {
    return stack.openMenus.findIndex(m => m.menu === menu);
  },

  isMenuOpen(stack: MenuStack, menu: ManagedMenu): boolean {
    return stack.openMenus.some(m => m.menu === menu);
  },

  isRootMenu(stack: MenuStack, menu: ManagedMenu): boolean {
    const {openMenus} = stack;
    return openMenus.length > 0 && openMenus[0].menu === menu;
  },

  isDeepestMenu(stack: MenuStack, menu: ManagedMenu): boolean {
    const {openMenus} = stack;
    return (
      openMenus.length > 0 &&
      openMenus[openMenus.length - 1].menu === menu
    );
  },

  getFocusedItem(stack: MenuStack, menu: ManagedMenu): MenuItem | null {
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
  },
};

export const EmptyStack: MenuStack = {
  openMenus: [],
  currentFocus: null,
};
