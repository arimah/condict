import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Shortcut, ShortcutMap} from '../command/shortcut';

import {StackContext} from './context';

/*\
|*| Mouse interactions inside menus can get a bit complex. The basic rules are
|*| as follows:
|*|
|*|   1. When the mouse *leaves* a menu, that menu stays open. After a short
|*|      timeout, any open submenus close. This short timeout gives the user
|*|      the ability to move onto the open submenu(s) to keep them open.
|*|
|*|   2. When the mouse *enters* a menu, it naturally stays open. After a short
|*|      time of not moving the mouse, the following happens (in order):
|*|
|*|        2a. Any open submenu closes.
|*|        2b. If the mouse is over an item with a submenu, it opens.
|*|
|*|      This is done in one operation, which means that, effectively, mousing
|*|      onto an already open item is a no-op, except that any open submenus
|*|      of that submenu get closed.
|*|
|*|   3. Clicking an item with a submenu causes it to behave as though it had
|*|      been hovered for a short time: it opens the submenu, and closes any
|*|      nested submenus that may have been open.
|*|
|*|   4. Mousedown outside the currently open menu tree immediately closes
|*|      the entire tree.
|*|
|*|   5. Keyboard focus follows the deepest open submenu, irrespective of
|*|      where the mouse currently is. In essence, an open menu "traps" all
|*|      key events. (Each menu takes care of this, by focusing itself after
|*|      an update as necessary.)
|*|
|*| We also have the following key events to contend with:
|*|
|*|   6. Arrow up and arrow down move focus through the deepest submenu. If
|*|      there is no currently focused item, down focuses the first, and up
|*|      focuses the last.
|*|
|*|   7. Arrow right opens the focused item's submenu, if there is one. The
|*|      first item of the submenu is selected as well. If the item has no
|*|      submenu, the event is allowed to propagate all the way up, so that
|*|      the menu bar (if present) can move to the next top-level menu.
|*|
|*|   8. Arrow left and Escape both close the deepest submenu and set focus
|*|      to the item that the submenu belongs to. In the top-level menu, only
|*|      Escape closes the menu; left is allowed to propagate upwards, again
|*|      so that the menu bar (if present) can move to the *previous* menu.
|*|
|*|   9. Enter activates the current menu item. If it has a submenu, see (7);
|*|      otherwise, the entire menu tree is closed following activation.
|*|
|*|  10. Pressing Tab or Shift+Tab inside a menu has no effect.
|*|
|*|  11. Typing a character moves focus to the first menu item matching that
|*|      character, if there is any. If the focus is already on a matching item,
|*|      it moves to the next, wrapping around the end as necessary.
|*|
|*| Some miscellaneous additional interactions:
|*|
|*|  12. If the page loses focus, the entire menu tree closes. This emulates
|*|      native menu behaviour.
|*|
|*| Finally, when the top-level menu closes, focus returns to the menu trigger
|*| (typically a menu bar, button or similar). This is handled entirely by the
|*| component that opened the menu (MenuTrigger, menu bar, whatever).
\*/

// In development, it's impossible to debug menus if they keep closing whenever
// the page loses focus; you can't inspect it in your dev tools that way. This
// variable can be set to keep menus open when the page loses focus.
if (process.env.NODE_ENV === 'development') {
  window.__CONDICT_DEV_KEEP_MENUS_OPEN__ = false;
}

const nextTick = fn => window.setTimeout(() => fn(), 0);

// Represents an open menu. The value contains the menu itself (a ManagedMenu)
// and the item (as a MenuItem, from ./context) that opened it.
class OpenMenu {
  constructor(menu, parentItem) {
    this.menu = menu;
    this.parentItem = parentItem;
  }

  elemToItem(elem) {
    return this.menu.items.itemRefList.find(
      item => item.self.contains(elem)
    ) || null;
  }

  filterItems(pred) {
    return this.menu.items.filter(pred);
  }
}

// Contains the current state of the menu tree. It contains the currently open
// menus, and the currently hovered menu item. It exposes various methods for
// manipulating the menu stack.
//
// It's called a "stack" because it only deals with the set of open menus
// (which is indeed a stack), and not the whole menu tree.
export class MenuStack {
  constructor(
    openMenus = [],
    currentFocus = null
  ) {
    this.openMenus = openMenus;
    this.currentFocus = currentFocus;
  }

  withCurrentFocus(currentFocus) {
    if (this.currentFocus === currentFocus) {
      return this;
    }

    return new MenuStack(this.openMenus, currentFocus);
  }

  withOpenMenus(openMenus) {
    if (this.openMenus === openMenus) {
      return this;
    }

    return new MenuStack(openMenus, this.currentFocus);
  }

  moveFocus(cb) {
    const {openMenus, currentFocus} = this;
    const currentMenu = openMenus[openMenus.length - 1];
    return this.withCurrentFocus(
      cb(currentMenu.menu.items, currentFocus)
    );
  }

  openRoot(menu) {
    return this
      .withOpenMenus([new OpenMenu(menu, null)])
      .withCurrentFocus(null);
  }

  openSubmenu(parentItem) {
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

    // Close every menu that's deeper in the stack than the item's parent menu,
    // then open the new submenu underneath the parent menu.
    const newOpenMenus = openMenus.slice(0, parentMenuIndex + 1);
    newOpenMenus.push(new OpenMenu(parentItem.submenu, parentItem));
    let newStack = this.withOpenMenus(newOpenMenus);

    return newStack;
  }

  activateCurrent() {
    const {currentFocus} = this;
    if (currentFocus && !currentFocus.disabled) {
      if (currentFocus.submenu) {
        return this.openSubmenu(currentFocus);
      } else {
        nextTick(currentFocus.onActivate);
        return this.closeAll();
      }
    }
    return this;
  }

  closeAll() {
    return new MenuStack();
  }

  closeOne() {
    const {openMenus} = this;
    const currentMenu = openMenus[openMenus.length - 1];
    return this
      .withOpenMenus(openMenus.slice(0, -1))
      .withCurrentFocus(currentMenu.parentItem);
  }

  closeUpTo(openMenu) {
    const {openMenus} = this;
    const index = openMenus.indexOf(openMenu);
    return this.withOpenMenus(openMenus.slice(0, index + 1));
  }
}

// The time, in milliseconds, that the mouse has to stay still before menu
// items are automatically opened/closed.
const INTENT_TIME = 400;

const KeyboardMap = new ShortcutMap(
  [
    {
      key: Shortcut.parse('Escape'),
      exec: stack => stack.closeOne(),
    },
    {
      key: Shortcut.parse('ArrowUp'),
      exec: stack =>
        stack.moveFocus((items, current) =>
          current
            ? items.getPrevious(current)
            : items.getLast()
        ),
    },
    {
      key: Shortcut.parse('ArrowDown'),
      exec: stack =>
        stack.moveFocus((items, current) =>
          current
            ? items.getNext(current)
            : items.getFirst()
        ),
    },
    {
      key: Shortcut.parse('ArrowRight'),
      exec: (stack, manager) => {
        const {currentFocus} = stack;
        if (currentFocus && currentFocus.submenu && !currentFocus.disabled) {
          manager.firstNeedsFocus = true;
          return stack.openSubmenu(currentFocus);
        }
        return stack;
      },
    },
    {
      key: Shortcut.parse('ArrowLeft'),
      exec: stack => {
        // Pressing the left arrow key causes the menu to close, effectively
        // moving you up one level.
        if (stack.openMenus.length > 1) {
          return stack.closeOne();
        }
        return stack;
      },
    },
    {
      key: Shortcut.parse('Enter'),
      exec: (stack, manager) => {
        manager.firstNeedsFocus = true;
        return stack.activateCurrent();
      },
    },
  ],
  cmd => cmd.key
);

export default class MenuManager extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stack: new MenuStack(),
    };

    this.awaitIntent = this.awaitIntent.bind(this);
    this.cancelIntent = this.cancelIntent.bind(this);

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);

    this.lastMouseTarget = null;
    this.firstNeedsFocus = false;
  }

  open(rootMenu) {
    const {stack} = this.state;
    if (stack.openMenus.length === 0) {
      this.setState({
        stack: stack.openRoot(rootMenu),
      });
    }
  }

  componentDidUpdate(_prevProps, prevState) {
    const prevStack = prevState.stack;
    const nextStack = this.state.stack;

    if (prevStack.openMenus !== nextStack.openMenus) {
      if (nextStack.openMenus.length > 0) {
        this.attachEvents();

        if (this.firstNeedsFocus) {
          const {openMenus} = nextStack;
          const deepestMenu = openMenus[openMenus.length - 1];
          this.setState({
            stack: nextStack
              .withCurrentFocus(deepestMenu.menu.items.getFirst()),
          });
          this.firstNeedsFocus = false;
        }
      } else {
        this.detachEvents();

        if (this.props.onClose)  {
          this.props.onClose();
        }
      }
    }
  }

  componentWillUnmount() {
    this.cancelIntent();
    this.detachEvents();
  }

  attachEvents() {
    document.body.addEventListener('mousemove', this.handleMouseMove);
    document.body.addEventListener('mousedown', this.handleMouseDown);
    document.body.addEventListener('click', this.handleClick);
    document.body.addEventListener('keydown', this.handleKeyDown);
    document.body.addEventListener('keypress', this.handleKeyPress);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  detachEvents() {
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('mousedown', this.handleMouseDown);
    document.body.removeEventListener('click', this.handleClick);
    document.body.removeEventListener('keydown', this.handleKeyDown);
    document.body.removeEventListener('keypress', this.handleKeyPress);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  awaitIntent(cb) {
    this.cancelIntent();
    this.intentTimeoutId = window.setTimeout(() => {
      const stack = cb(this.state.stack);
      this.setState({stack});
    }, INTENT_TIME);
  }

  cancelIntent() {
    if (this.intentTimeoutId) {
      window.clearTimeout(this.intentTimeoutId);
      this.intentTimeoutId = null;
    }
  }

  handleMouseMove(e) {
    let {stack} = this.state;
    const {openMenus} = stack;

    // Find the currently hovered menu, if any.
    const currentMenu = openMenus.find(m => m.menu.contains(e.target));
    if (currentMenu) {
      // We are somewhere inside the menu tree, so we need to Do Some Things™.
      const currentItem = currentMenu.elemToItem(e.target);

      // Even if we aren't on top of an item (e.g. the mouse is on a separator
      // or the menu's padding area), we need wait a bit, as any open submenus
      // need to be closed after a delay.
      this.awaitIntent(stack => {
        if (currentItem && currentItem.submenu && !currentItem.disabled) {
          return stack.openSubmenu(currentItem);
        } else {
          return stack.closeUpTo(currentMenu);
        }
      });

      stack = stack.withCurrentFocus(currentItem);
    } else {
      // lastMouseTarget is the last hovered element, which we can use to find
      // what the last hovered *menu* was.
      const lastMenu = openMenus.find(
        m => m.menu.contains(this.lastMouseTarget)
      );

      // If the mouse was indeed inside one of the menus, start an intent
      // timer that closes everything up to the last menu.
      if (lastMenu) {
        this.awaitIntent(stack => stack.closeUpTo(lastMenu));
      }

      stack = stack.withCurrentFocus(null);
    }

    this.lastMouseTarget = e.target;
    if (stack !== this.state.stack) {
      this.setState({stack});
    }
  }

  handleMouseDown(e) {
    // Mousedown anywhere outside the menu tree immediately closes everything.
    const {stack} = this.state;
    const {openMenus} = stack;
    const isInsideMenu = openMenus.some(m => m.menu.contains(e.target));
    if (!isInsideMenu) {
      this.cancelIntent();
      this.setState({stack: stack.closeAll()});
    }
  }

  handleClick() {
    const {stack} = this.state;
    this.cancelIntent();
    this.setState({stack: stack.activateCurrent()});
  }

  handleKeyDown(e) {
    // The event must not escape the menu system.
    // TODO: left/right arrows for menu bars.
    e.stopPropagation();

    let {stack} = this.state;

    const command = KeyboardMap.get(e);
    if (command) {
      // Only prevent default if the key combination was captured. Otherwise,
      // the keypress event is not emitted, as preventing default cancels the
      // input.
      e.preventDefault();
      stack = command.exec(stack, this);
    }
    this.setState({stack});
  }

  handleKeyPress(e) {
    e.stopPropagation();
    e.preventDefault();

    const typedText = e.key.trim().toLowerCase();
    if (typedText) {
      const {stack} = this.state;
      const {currentFocus, openMenus} = stack;
      const deepestMenu = openMenus[openMenus.length - 1];

      // Find items whose label starts with the typed text.
      const matchingItems = deepestMenu.filterItems(
        item => item.label.toLowerCase().startsWith(typedText)
      );

      if (matchingItems.length === 1) {
        // If there is exactly one matching item, it becomes activated.
        this.firstNeedsFocus = true;
        this.setState({
          stack: stack
            .withCurrentFocus(matchingItems[0])
            .activateCurrent(),
        });
      } else if (matchingItems.length > 1) {
        // If there are multiple matching items, then continue after the
        // current item. That way you can cycle through items by typing
        // the same letter repeatedly.
        const currentIndex = matchingItems.indexOf(currentFocus);
        // If the current focus is not in the list, -1 + 1 = 0, so we end
        // up selecting the first item.
        const nextIndex = (currentIndex + 1) % matchingItems.length;
        this.setState({
          stack: stack.withCurrentFocus(matchingItems[nextIndex]),
        });
      }
    }
  }

  handleWindowBlur() {
    if (process.env.NODE_ENV === 'development') {
      if (window.__CONDICT_DEV_KEEP_MENUS_OPEN__) {
        return;
      }
    }

    // When the window loses focus, the entire menu tree closes immediately.
    const {stack} = this.state;
    this.setState({stack: stack.closeAll()});
  }

  render() {
    const {children} = this.props;
    const {stack} = this.state;

    return (
      <StackContext.Provider value={stack}>
        {children}
      </StackContext.Provider>
    );
  }
}

MenuManager.propTypes = {
  onClose: PropTypes.func,
  children: PropTypes.node,
};

MenuManager.defaultProps = {
  onClose: null,
};
