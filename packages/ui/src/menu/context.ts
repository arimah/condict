import React, {
  ReactNode,
  RefObject,
  KeyboardEventHandler,
  useContext,
  useEffect,
} from 'react';

import {Shortcut} from '../shortcut';
import Placement, {RelativeParent} from '../placement';
import {Descendants} from '../descendants';

import {
  RegisteredMenu,
  RegisteredItem,
  MenuStack,
  OpenMenu,
  CheckType,
} from './types';
import useLazyRef from '../lazy-ref';

export interface OwnerContextValue {
  readonly stack: MenuStack;

  register(menu: RegisteredMenu): () => void;

  dispatch(msg: OwnerMessage): void;

  open(
    menu: RegisteredMenu,
    parent: RelativeParent,
    placement?: Placement,
    fromKeyboard?: boolean
  ): void;

  onMenuKeyDown?: KeyboardEventHandler;

  onMenuKeyPress?: KeyboardEventHandler;
}

export type OwnerMessage =
  | {type: 'focusItem'; item: RegisteredItem | null}
  | {type: 'focusPrev'}
  | {type: 'focusNext'}
  | {
    type: 'openRoot';
    menu: RegisteredMenu;
    parent: RelativeParent;
    placement: Placement;
    fromKeyboard: boolean;
  }
  | {
    type: 'openSubmenu',
    menu: RegisteredMenu;
    placement: Placement;
    fromKeyboard: boolean;
  }
  | {
    type: 'activate';
    item?: RegisteredItem;
    submenuPlacement: Placement;
    fromKeyboard: boolean;
  }
  | {type: 'closeDeepest'}
  | {type: 'closeUpTo'; menu: OpenMenu}
  | {type: 'closeAll'}
  | {type: 'removePhantom'};

export const OwnerContext = React.createContext<OwnerContextValue | null>(null);

export const MenuContext = React.createContext<RegisteredMenu | null>(null);

export const useMenuItem = (
  id: string,
  elemRef: RefObject<HTMLDivElement>,
  submenuRef: RefObject<RegisteredMenu> | null,
  icon: ReactNode,
  label: string,
  shortcut: Shortcut | null,
  disabled: boolean,
  activate: () => void,
  checkType: CheckType
): RegisteredItem => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const parent = useContext(MenuContext)!;

  const item = useLazyRef<RegisteredItem>(() => ({
    id,
    parent,
    get elem() {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return elemRef.current!;
    },
    get submenu() {
      return submenuRef ? submenuRef.current : null;
    },
    icon,
    label,
    shortcut,
    disabled,
    activate,
    checkType,
  })).current;
  item.icon = icon;
  item.label = label;
  item.shortcut = shortcut;
  item.disabled = disabled;
  item.activate = activate;
  item.checkType = checkType;

  useEffect(() => {
    Descendants.register(parent.items, item);
    return () => Descendants.unregister(parent.items, item);
  }, []);

  return item;
};
