import React, {
  ReactNode,
  Ref,
  KeyboardEvent,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useImperativeHandle,
  useEffect,
} from 'react';

import Placement, {RelativeParent} from '../placement';
import {Descendants} from '../descendants';
import {WritingDirection, useWritingDirection} from '../writing-direction';
import {disableFocusManager, enableFocusManager} from '../focus';
import {Shortcut, ShortcutMap} from '../shortcut';
import useLazyRef from '../lazy-ref';

import {OwnerContext, OwnerContextValue, OwnerMessage} from './context';
import PhantomItem from './phantom-item';
import {RegisteredMenu, MenuStack} from './types';

export type Props = {
  onCloseRoot?: () => void;
  children: ReactNode;
};

export interface MenuOwnerHandle {
  open(
    options: {
      name?: string | null;
      parent: RelativeParent;
      placement?: Placement;
      fromKeyboard?: boolean;
    }
  ): void;
}

interface KeyCommand {
  key: Shortcut | null;
  exec(stack: MenuStack): OwnerMessage | null;
}

// The time, in milliseconds, that the mouse has to stay still before menu
// items are automatically opened/closed.
const IntentTime = 350;

const EmptyStack: MenuStack = {
  openMenus: [],
  currentItem: null,
  phantom: null,
};

const MenuOwner = React.forwardRef((
  props: Props,
  ref: Ref<MenuOwnerHandle>
) => {
  const {onCloseRoot, children} = props;

  const dir = useWritingDirection();

  const [stack, dispatch] = useReducer(reduce, EmptyStack);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const knownMenus = useRef<RegisteredMenu[]>([]);

  const ownerContext = useMemo<OwnerContextValue>(() => ({
    stack,
    dispatch,
    register(menu) {
      knownMenus.current.push(menu);
      return () => {
        const index = knownMenus.current.indexOf(menu);
        if (index !== -1) {
          knownMenus.current.splice(index, 1);
        }
      };
    },
    open(menu, parent, placement, fromKeyboard = false) {
      dispatch({
        type: 'openRoot',
        menu,
        parent,
        placement: placement ?? defaultPlacement(dir),
        fromKeyboard,
      });
    },
  }), [dir, stack]);

  useImperativeHandle(ref, () => ({
    open({name, parent, placement, fromKeyboard = false}) {
      const menu = name != null
        ? knownMenus.current.find(m => m.name === name)
        : knownMenus.current[0];
      if (menu) {
        dispatch({
          type: 'openRoot',
          menu,
          parent,
          placement: placement ?? defaultPlacement(dir),
          fromKeyboard,
        });
      }
    },
  }), [dir]);

  const intent = useLazyRef(() => {
    let timeoutId: number | undefined;
    return {
      set: (msg: OwnerMessage) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          dispatch(msg);
        }, IntentTime);
      },
      cancel: () => {
        window.clearTimeout(timeoutId);
      },
    };
  }).current;

  const refs = useRef({
    submenuPlacement: getSubmenuPlacement(dir),
    onCloseRoot,
  }).current;
  refs.submenuPlacement = getSubmenuPlacement(dir);
  refs.onCloseRoot = onCloseRoot;
  const keyboardMap = useMemo(() => getKeyboardMap(refs), []);

  ownerContext.onMenuKeyDown = useCallback((e: KeyboardEvent) => {
    // Do not allow key events to escape past the menu system.
    e.stopPropagation();

    const command = keyboardMap.get(e);
    if (command) {
      // Only prevent default if we found a matching command. Otherwise the
      // keypress event will not be emitted, and we won't be able to match
      // against typed characters.
      e.preventDefault();

      const msg = command.exec(stackRef.current);
      if (msg) {
        intent.cancel();
        dispatch(msg);
      }
    }
  }, [keyboardMap]);

  ownerContext.onMenuKeyPress = useCallback((e: KeyboardEvent) => {
    // Do not allow key events to escape past the menu system.
    e.stopPropagation();
    e.preventDefault();

    const typedText = e.key.trim().toLowerCase();
    if (!typedText) {
      return;
    }

    const stack = stackRef.current;
    const {currentItem, openMenus} = stack;
    const deepestMenu = openMenus[openMenus.length - 1];

    // Find items whose label starts with the typed text.
    const matches = Descendants.filter(deepestMenu.menu.items, i =>
      i.label.toLowerCase().startsWith(typedText)
    );

    if (matches.length === 1) {
      // If there is exactly one matching item, it becomes activated.
      dispatch({
        type: 'activate',
        item: matches[0],
        submenuPlacement: refs.submenuPlacement,
        fromKeyboard: true,
      });
      intent.cancel();
    } else if (matches.length > 1) {
      // If there are multiple matching items, then continue after the
      // current item. That way you can cycle through items by typing
      // the same letter repeatedly.
      const currentIndex = currentItem !== null
        ? matches.indexOf(currentItem)
        : -1;
      // If the current focus is not in the list, -1 + 1 = 0, so we end
      // up selecting the first item.
      const nextIndex = (currentIndex + 1) % matches.length;
      dispatch({type: 'focusItem', item: matches[nextIndex]});
      intent.cancel();
    }
  }, []);

  const anyMenuOpen = stack.openMenus.length > 0;
  useEffect(() => {
    if (!anyMenuOpen) {
      refs.onCloseRoot?.();
      return;
    }

    let lastTarget: Node | null = null;

    const mouseMove = (e: MouseEvent) => {
      const target = e.target as Node;

      const {openMenus, currentItem} = stackRef.current;
      const hoveredMenu = openMenus.find(m =>
        m.menu.elem.contains(target)
      );

      if (hoveredMenu) {
        const hoveredItem = Descendants.first(hoveredMenu.menu.items, i =>
          i.elem.contains(target)
        );

        if (currentItem !== hoveredItem) {
          dispatch({type: 'focusItem', item: hoveredItem});
        }

        const hasAvailableSubmenu =
          hoveredItem &&
          hoveredItem.submenu &&
          !hoveredItem.disabled;
        intent.set(
          hasAvailableSubmenu ? {
            type: 'openSubmenu',
            menu: hoveredItem.submenu,
            placement: refs.submenuPlacement,
            fromKeyboard: false,
          } : {type: 'closeUpTo', menu: hoveredMenu}
        );
      } else {
        // The mouse is moving outside the menu system. In this case, if the
        // mouse was previously inside a menu, we close everything deeper
        // than that menu after an intent timeout.
        // If the mouse did *not* just leave the menu system, ignore its
        // movements and just wait for it to re-enter.
        const lastMenu = openMenus.find(m =>
          m.menu.elem.contains(lastTarget)
        );
        if (lastMenu) {
          intent.set({type: 'closeUpTo', menu: lastMenu});
        }

        if (currentItem !== null) {
          dispatch({type: 'focusItem', item: null});
        }
      }
      lastTarget = target;
    };

    const mouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      const {openMenus} = stackRef.current;
      const isInMenu = openMenus.some(m => m.menu.elem.contains(target));
      if (!isInMenu) {
        // mousedown outside the menu system closes all menus immediately
        intent.cancel();
        dispatch({type: 'closeAll'});
        return;
      }
    };

    const click = () => {
      intent.cancel();
      dispatch({
        type: 'activate',
        submenuPlacement: refs.submenuPlacement,
        fromKeyboard: false,
      });
    };

    // When the window loses focus, the menu system closes immediately
    const windowBlur = () => dispatch({type: 'closeAll'});

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mousedown', mouseDown);
    document.addEventListener('click', click);
    window.addEventListener('blur', windowBlur);
    disableFocusManager();
    return () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mousedown', mouseDown);
      document.removeEventListener('click', click);
      window.removeEventListener('blur', windowBlur);
      enableFocusManager();
    };
  }, [anyMenuOpen]);

  return (
    <OwnerContext.Provider value={ownerContext}>
      {children}
      {stack.phantom && <PhantomItem {...stack.phantom}/>}
    </OwnerContext.Provider>
  );
});

MenuOwner.displayName = 'MenuOwner';

export default MenuOwner;

const defaultPlacement = (dir: WritingDirection): Placement =>
  dir === 'ltr' ? 'BELOW_LEFT' : 'BELOW_RIGHT';

const getSubmenuPlacement = (dir: WritingDirection): Placement =>
  dir === 'ltr' ? 'RIGHT_TOP' : 'LEFT_TOP';

const reduce = (stack: MenuStack, msg: OwnerMessage): MenuStack => {
  switch (msg.type) {
    case 'focusItem':
      return {
        ...stack,
        currentItem: msg.item,
      };
    case 'focusPrev': {
      const {openMenus, currentItem} = stack;
      const deepestMenu = openMenus[openMenus.length - 1].menu;
      return {
        ...stack,
        currentItem: currentItem
          ? Descendants.prevWrapping(deepestMenu.items, currentItem)
          : Descendants.last(deepestMenu.items),
      };
    }
    case 'focusNext': {
      const {openMenus, currentItem} = stack;
      const deepestMenu = openMenus[openMenus.length - 1].menu;
      return {
        ...stack,
        currentItem: currentItem
          ? Descendants.nextWrapping(deepestMenu.items, currentItem)
          : Descendants.first(deepestMenu.items),
      };
    }
    case 'openRoot': {
      const {menu, parent, placement, fromKeyboard} = msg;
      return {
        ...stack,
        openMenus: [
          {
            menu,
            depth: 0,
            parent,
            placement,
            focusFirstOnOpen: fromKeyboard,
          },
        ],
        currentItem: null,
      };
    }
    case 'openSubmenu': {
      const {menu, placement, fromKeyboard} = msg;
      // Find the *parent menu* of the submenu we need to open, so we can close
      // everything up to it, then open the submenu under it.

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parentItem = menu.parentItem!;
      const parentDepth = stack.openMenus.findIndex(m =>
        m.menu === parentItem.parent
      );
      return {
        ...stack,
        openMenus: [
          ...stack.openMenus.slice(0, parentDepth + 1),
          {
            menu,
            depth: parentDepth + 1,
            parent: parentItem.elem,
            placement,
            focusFirstOnOpen: fromKeyboard,
          },
        ],
        // This message can only be sent as a result of *mouse* interactions.
        // In that case, the mouse movements should cause an appropriate item
        // to be focused.
        currentItem: null,
      };
    }
    case 'activate': {
      const {item = stack.currentItem, submenuPlacement, fromKeyboard} = msg;
      if (!item || item.disabled) {
        return stack;
      }

      if (item.submenu) {
        return reduce(stack, {
          type: 'openSubmenu',
          menu: item.submenu,
          placement: submenuPlacement,
          fromKeyboard,
        });
      } else {
        window.setTimeout(item.activate);
        const rect = item.elem.getBoundingClientRect();
        return {
          openMenus: [],
          currentItem: null,
          phantom: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            icon: item.icon,
            label: item.label,
            shortcut: item.shortcut,
            checkType: item.checkType,
          },
        };
      }
    }
    case 'closeDeepest': {
      const closedMenu = stack.openMenus[stack.openMenus.length - 1];
      return {
        ...stack,
        openMenus: stack.openMenus.slice(0, -1),
        // This message can only be sent as a result of *keyboard* interactions.
        // We must focus the parent item of the menu that was just closed. If
        // we closed the root menu, the parentItem is null, so currentItem is
        // correctly cleared.
        currentItem: closedMenu.menu.parentItem,
      };
    }
    case 'closeUpTo':
      if (msg.menu.depth == stack.openMenus.length - 1) {
        return stack;
      }
      return {
        ...stack,
        openMenus: stack.openMenus.slice(0, msg.menu.depth + 1),
      };
    case 'closeAll':
      return {...stack, openMenus: [], currentItem: null};
    case 'removePhantom':
      return {...stack, phantom: null};
  }
};

const getKeyboardMap = (refs: {submenuPlacement: Placement}) =>
  new ShortcutMap<KeyCommand>(
    [
      {
        key: Shortcut.parse('Escape'),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        exec: () => ({type: 'closeDeepest'}),
      },
      {
        key: Shortcut.parse('ArrowUp'),
        exec: () => ({type: 'focusPrev'}),
      },
      {
        key: Shortcut.parse('ArrowDown'),
        exec: () => ({type: 'focusNext'}),
      },
      {
        key: Shortcut.parse('ArrowRight'),
        exec(stack) {
          const {currentItem} = stack;
          if (currentItem && currentItem.submenu && !currentItem.disabled) {
            return {
              type: 'openSubmenu',
              menu: currentItem.submenu,
              placement: refs.submenuPlacement,
              fromKeyboard: true,
            };
          }
          return null;
        },
      },
      {
        key: Shortcut.parse('ArrowLeft'),
        exec: stack =>
          // Pressing the left arrow key causes the deepest submenu to close,
          // effectively moving you up one level.
          stack.openMenus.length > 1 ? {type: 'closeDeepest'} : null,
      },
      {
        key: Shortcut.parse('Enter'),
        exec: () => ({
          type: 'activate',
          submenuPlacement: refs.submenuPlacement,
          fromKeyboard: true,
        }),
      },
      {
        key: Shortcut.parse(['Tab', 'Shift+Tab']),
        // Do nothing; we just need to cancel tab events.
        exec: () => null,
      },
    ],
    cmd => cmd.key
  );
