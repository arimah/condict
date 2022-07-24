# Menu implementation notes

Menu systems are *complicated*. This document summarises the various concerns involved in implementing a menu system as close to native (in behaviour) as possible.

## Interactions

For mouse interactions, we have the following rules:

* When the mouse *leaves* a menu, that menu stays open. After a short timeout, any open submenus close. This short timeout gives the user the ability to move onto the open submenu(s) to keep them open.

* When the mouse *enters* a menu, it naturally stays open. After a short time of not moving the mouse, the following happens (in order):

    1. Any open submenu closes.
    2. If the mouse is over an item with a submenu, it opens.

    This is done in one operation, which means that, effectively, mousing onto an already open item is a no-op, except that any open submenus of that submenu get closed.

* Clicking an item with a submenu causes it to behave as though it had been hovered for a short time: it opens the submenu, and closes any nested submenus that may have been open.

* Mousedown outside the currently open menu tree immediately closes the entire tree.

* Keyboard focus follows the deepest open submenu, irrespective of where the mouse currently is. In essence, an open menu "traps" all key events.

We also have the following key events to contend with:

* Arrow up and arrow down move focus through the deepest submenu. If there is no currently focused item, down focuses the first, and up focuses the last.

* Arrow right opens the focused item's submenu, if there is one. The first item of the submenu is selected as well. If the item has no submenu, nothing happens.

* Arrow left and Escape both close the deepest submenu and set focus to the item that the submenu belongs to. In the top-level menu, only Escape closes the menu; left does nothing.

* Enter activates the current menu item. If it has a submenu, it opens; otherwise, the entire menu tree is closed following activation.

* Pressing Tab or Shift+Tab inside a menu has no effect.

* Typing a character moves focus to the first menu item matching that character, if there is any. If the focus is already on a matching item, it moves to the next, wrapping around the end as necessary.

Some miscellaneous additional interactions:

* If the page loses focus, the entire menu tree closes. This emulates native menu behaviour.

Finally, when the top-level menu closes, focus returns to the menu trigger (typically a menu bar, button or similar). This is handled entirely by the component that opened the menu (MenuTrigger, menu bar, whatever).

## ARIA

For maximum compatibility, we need to ensure the following:

* Focus should always be on an element with `role="menu"`.
* The current menu item is referenced with `aria-activedescendant` on the parent menu element.
* Menu item shortcuts are assigned to `aria-keyshortcuts`, as a reference for the user. The menu system does not listen for the shortcuts.
* A disabled menu item needs `aria-disabled="true"`.
* A menu item with a submenu:
  - Needs `aria-haspopup="menu"`.
  - Needs `aria-owns` with the ID of the submenu. This means we must actually render that menu, but can skip rendering of the menu's *items* until they're needed (i.e. until the menu opens). 
