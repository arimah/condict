import {ReactNode} from 'react';

import {Descendants} from '../descendants';
import Placement, {RelativeParent} from '../placement';
import {Shortcut} from '../shortcut';

export interface RegisteredMenu {
  readonly elem: HTMLElement;
  readonly items: Descendants<RegisteredItem>;
  readonly parentItem: RegisteredItem | null;
  name: string | undefined;
}

export interface RegisteredItem {
  /** HTML ID of the item, for ARIA attributes.*/
  readonly id: string;
  readonly elem: HTMLElement;
  readonly parent: RegisteredMenu;
  readonly submenu: RegisteredMenu | null;
  disabled: boolean;
  icon: ReactNode;
  label: string;
  shortcut: Shortcut | null;
  activate: () => void;
  checkType: CheckType;
}

export type CheckType =
  | 'checkOn'
  | 'checkOff'
  | 'radioOn'
  | 'radioOff'
  | 'none';

export interface MenuStack {
  readonly openMenus: readonly OpenMenu[];
  readonly currentItem: RegisteredItem | null;
  readonly phantom: PhantomProps | null;
}

export interface OpenMenu {
  readonly menu: RegisteredMenu;
  readonly depth: number;
  readonly parent: RelativeParent;
  readonly placement: Placement;
  readonly focusFirstOnOpen: boolean;
}

export interface PhantomProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly icon: ReactNode;
  readonly label: string;
  readonly shortcut: Shortcut | null;
  readonly checkType: CheckType;
}
