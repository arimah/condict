import {WritingDirection} from '../writing-direction';

import {OpenMenu, MenuParent} from './types';
import * as S from './styles';

interface ParentRect {
  readonly top: number;
  readonly left: number;
  readonly bottom: number;
  readonly right: number;
}

const placeMenu = (menu: OpenMenu, dir: WritingDirection): void => {
  if (menu.depth == 0) {
    placeRootMenu(menu, dir);
  } else {
    placeSubmenu(menu, dir);
  }
};

export default placeMenu;

const placeRootMenu = (menu: OpenMenu, dir: WritingDirection): void => {
  const {elem} = menu.menu;
  const self = elem.getBoundingClientRect();
  const parent = getParentRect(menu.parent);
  const viewport = getViewport();

  // For the y coordinate, we follow a simple rule: prefer to open down.
  // If there is *not* enough space below *and* we can fit the menu above,
  // then we do that instead. In all other cases, the menu is positioned
  // below somewhere, clamping at the bottom of the viewport as necessary.
  const fitsAbove = parent.top - self.height >= 0;
  const fitsBelow = parent.bottom + self.height <= viewport.height;
  const y = !fitsBelow && fitsAbove
    ? parent.top - self.height
    : clamp(parent.bottom, 0, viewport.height - self.height);

  // Same sort of idea, except we prefer to grow in the writing direction.
  // Note:
  //     [parent]                  [parent]
  //     +------------+      +------------+
  //     | grows R -> |      | <- grows L |
  //     +------------+      +------------+
  const canGrowLeft = parent.right - self.width >= 0;
  const canGrowRight = parent.left + self.width <= viewport.width;
  const shouldGrowLeft = dir == 'ltr'
    // For LTR, left is the alternative, which we only pick if it fits *and*
    // the normal direction doesn't.
    ? !canGrowRight && canGrowLeft
    // For RTL, left is the default direction, and right is the alternative;
    // hence, the condition is negated.
    : !(!canGrowLeft && canGrowRight);
  const x = clamp(
    shouldGrowLeft ? parent.right - self.width : parent.left,
    0,
    viewport.width - self.width
  );

  elem.style.top = `${y}px`;
  elem.style.left = `${x}px`;
};

const placeSubmenu = (menu: OpenMenu, dir: WritingDirection): void => {
  const {elem} = menu.menu;
  const self = elem.getBoundingClientRect();
  const parent = getParentRect(menu.parent);
  const viewport = getViewport();

  // Submenus always grow down (clamped at the bottom of the viewport).
  // The only minor caveat is that it must be moved up by the top padding
  // of the menu, so that the first submenu item aligns perfectly with
  // the item that owns the submenu.
  const y = clamp(
    parent.top - S.MenuPaddingBlock,
    0,
    viewport.height - self.height
  );

  // As with the root menu, prefer to grow in the writing direction.
  //
  //     +-----------+[parent]+-----------+
  //     | fits L    |        | fits R    |
  //     +-----------+        +-----------+
  const fitsLeft = parent.left - self.width >= 0;
  const fitsRight = parent.right + self.width <= viewport.width;
  const shouldGrowLeft = dir === 'ltr'
    ? !fitsRight && fitsLeft
    : !(!fitsLeft && fitsRight);
  const x = clamp(
    shouldGrowLeft ? parent.left - self.width : parent.right,
    0,
    viewport.width - self.width
  );

  elem.style.top = `${y}px`;
  elem.style.left = `${x}px`;
};

const getParentRect = (parent: MenuParent): ParentRect => {
  if (parent instanceof Element) {
    return parent.getBoundingClientRect();
  }
  if (parent instanceof DOMRectReadOnly) {
    return parent;
  }
  return {
    top: parent.y,
    bottom: parent.y,
    left: parent.x,
    right: parent.x,
  };
};

const getViewport = () => ({
  // These do NOT include the scrollbar.
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
});

const clamp = (value: number, min: number, max: number) =>
  value < min ? min :
  value > max ? max :
  value;
