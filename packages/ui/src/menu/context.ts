import React, {RefObject, useState, useContext, useEffect} from 'react';

import DescendantCollection from '../descendant-collection';
import Placement from '../placement';

import MenuStack from './menu-stack';
import ManagedMenu from './managed-menu';
import MenuManager from './manager';

export type ManagedTreeContextValue = {
  stack: MenuStack;
  manager: MenuManager;
};

export const ManagedTreeContext =
  React.createContext<ManagedTreeContextValue | null>(null);

export type MenuContextValue = {
  items: DescendantCollection<MenuItem, HTMLElement>;
  currentFocus: MenuItem | null;
  submenuPlacement: Placement;
};

export const MenuContext = React.createContext<MenuContextValue | null>(null);

export type MenuItemValue = {
  hasFocus: boolean;
  submenuPlacement: Placement;
};

export class MenuItem {
  public label!: string;
  public disabled!: boolean;
  public onActivate!: () => void;
  public renderPhantom!: () => JSX.Element;

  private readonly ref: RefObject<HTMLElement>;
  private readonly submenuRef: RefObject<ManagedMenu> | null;

  public constructor(
    ref: RefObject<HTMLElement>,
    submenuRef: RefObject<ManagedMenu> | null
  ) {
    this.ref = ref;
    this.submenuRef = submenuRef;
  }

  public get id(): string {
    return this.self.id;
  }

  public get self(): HTMLElement {
    if (!this.ref.current) {
      throw new Error('Menu item has been unmounted but not removed from menu manager');
    }
    return this.ref.current;
  }

  public get submenu(): ManagedMenu | null {
    return this.submenuRef && this.submenuRef.current;
  }
}

export const useNearestMenu = (
  ref: RefObject<HTMLElement>,
  submenuRef: RefObject<ManagedMenu> | null,
  label: string,
  disabled: boolean,
  onActivate: () => void,
  renderPhantom: () => JSX.Element
): MenuItemValue => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('Menu item must be placed inside a menu');
  }

  const [item] = useState(() => new MenuItem(ref, submenuRef));
  item.label = label;
  item.disabled = disabled;
  item.onActivate = onActivate;
  item.renderPhantom = renderPhantom;

  context.items.register(item);
  useEffect(() => () => context.items.unregister(item), []);

  return {
    hasFocus: context.currentFocus === item,
    submenuPlacement: context.submenuPlacement,
  };
};

export const useManagedTree = (): ManagedTreeContextValue => {
  const value = useContext(ManagedTreeContext);
  if (!value) {
    throw new Error('Menu must be mounted inside a MenuManager');
  }
  return value;
};
