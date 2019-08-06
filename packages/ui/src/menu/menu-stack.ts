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
export default class MenuStack {
  public readonly openMenus: OpenMenu[];
  public readonly currentFocus: MenuItem | null;

  public constructor(
    openMenus: OpenMenu[] = [],
    currentFocus: MenuItem | null = null
  ) {
    this.openMenus = openMenus;
    this.currentFocus = currentFocus;
  }

  public withCurrentFocus(currentFocus: MenuItem | null): MenuStack {
    if (this.currentFocus === currentFocus) {
      return this;
    }

    return new MenuStack(this.openMenus, currentFocus);
  }

  public withOpenMenus(openMenus: OpenMenu[]): MenuStack {
    if (this.openMenus === openMenus) {
      return this;
    }

    return new MenuStack(openMenus, this.currentFocus);
  }

  public moveFocus(
    cb: (
      items: DescendantCollection<MenuItem, HTMLElement>,
      current: MenuItem | null
    ) => MenuItem | null
  ): MenuStack {
    const {openMenus, currentFocus} = this;
    const currentMenu = openMenus[openMenus.length - 1];
    return this.withCurrentFocus(
      cb(currentMenu.menu.items, currentFocus)
    );
  }

  public openRoot(menu: ManagedMenu): MenuStack {
    return this
      .withOpenMenus([new OpenMenu(menu, null)])
      .withCurrentFocus(null);
  }

  public openSubmenu(parentItem: MenuItem): MenuStack {
    // First, let's find which menu the item belongs to.
    const {openMenus} = this;
    const parentMenuIndex = openMenus.findIndex(
      m => m.menu.contains(parentItem.self)
    );
    if (parentMenuIndex === -1) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Cannot open an item that is not in the current stack:', {
          item: parentItem,
          stack: this,
        });
      }
      return this;
    }
    if (!parentItem.submenu) {
      return this;
    }

    // Close every menu that's deeper in the stack than the item's parent menu,
    // then open the new submenu underneath the parent menu.
    const newOpenMenus = openMenus.slice(0, parentMenuIndex + 1);
    newOpenMenus.push(new OpenMenu(parentItem.submenu, parentItem));
    let newStack = this.withOpenMenus(newOpenMenus);

    return newStack;
  }

  public activateCurrent(manager: MenuManager): MenuStack {
    const {currentFocus} = this;
    if (currentFocus && !currentFocus.disabled) {
      if (currentFocus.submenu) {
        return this.openSubmenu(currentFocus);
      } else {
        nextTick(currentFocus.onActivate);
        manager.addPhantom(currentFocus);
        return this.closeAll();
      }
    }
    return this;
  }

  public closeAll(): MenuStack {
    return new MenuStack();
  }

  public closeOne(): MenuStack {
    const {openMenus} = this;
    const currentMenu = openMenus[openMenus.length - 1];
    return this
      .withOpenMenus(openMenus.slice(0, -1))
      .withCurrentFocus(currentMenu.parentItem);
  }

  public closeUpTo(openMenu: OpenMenu): MenuStack {
    const {openMenus} = this;
    const index = openMenus.indexOf(openMenu);
    return this.withOpenMenus(openMenus.slice(0, index + 1));
  }
}
