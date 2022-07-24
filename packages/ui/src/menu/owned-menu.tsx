import {
  ReactNode,
  Ref,
  useContext,
  useRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import ReactDOM from 'react-dom';

import Placement, {RelativeParent, placeElement} from '../placement';
import {compareNodes, Descendants} from '../descendants';
import useLazyRef from '../lazy-ref';

import {MenuContext, OwnerContext} from './context';
import getContainer from './container';
import {MenuStack, OpenMenu, RegisteredItem, RegisteredMenu} from './types';
import * as S from './styles';

export type Props = {
  name?: string;
  id?: string;
  label?: string;
  parentItem: RegisteredItem | null;
  publicRef?: Ref<MenuHandle>;
  privateRef?: Ref<RegisteredMenu>;
  onClose?: () => void;
  children?: ReactNode;
};

export interface MenuHandle {
  open(
    options: {
      parent: RelativeParent;
      placement?: Placement;
      fromKeyboard?: boolean;
    }
  ): void;
}

const OwnedMenu = (props: Props): JSX.Element => {
  const {
    name,
    id,
    label,
    parentItem,
    publicRef,
    privateRef,
    onClose,
    children,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const owner = useContext(OwnerContext)!;

  const elemRef = useRef<HTMLDivElement>(null);

  const menu = useLazyRef<RegisteredMenu>(() => ({
    name,
    items: Descendants.create<RegisteredItem>(
      (a, b) => compareNodes(a.elem, b.elem)
    ),
    parentItem,
    get elem() {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return elemRef.current!;
    },
  })).current;
  menu.name = name;

  useImperativeHandle(privateRef, () => menu, [menu]);

  useImperativeHandle(publicRef, () => ({
    open({parent, placement, fromKeyboard}) {
      owner.open(menu, parent, placement, fromKeyboard);
    },
  }), [owner]);

  // parentItem cannot change; we don't need it as a dependency.
  useEffect(() => {
    if (parentItem === null) {
      return owner.register(menu);
    }
    return;
  }, []);

  const {stack} = owner;
  const openMenu = stack.openMenus.find(m => m.menu === menu);
  const deepestMenu = stack.openMenus[stack.openMenus.length - 1];

  const isOpen = openMenu !== undefined;
  const {current: prevState} = useRef({
    open: false,
    deepest: deepestMenu,
  });

  useEffect(() => {
    if (isOpen !== prevState.open) {
      if (isOpen) {
        if (elemRef.current) {
          elemRef.current.style.opacity = '1';
          placeElement(elemRef.current, openMenu.parent, openMenu.placement);
        }
        if (openMenu.focusFirstOnOpen) {
          const item = Descendants.first(menu.items);
          owner.dispatch({
            type: 'focusItem',
            item,
          });
        }
      } else {
        if (elemRef.current) {
          elemRef.current.style.opacity = '0';
        }
        onClose?.();
      }
      prevState.open = isOpen;
    }
  }, [openMenu]);

  useEffect(() => {
    if (deepestMenu !== prevState.deepest) {
      // The menu must focus itself when it becomes the deepest menu.
      if (openMenu === deepestMenu) {
        elemRef.current?.focus({preventScroll: true});
      }
      prevState.deepest = deepestMenu;
    }
  }, [deepestMenu]);

  const focusedItem = findFocusedItem(stack, openMenu);

  // Menu trees can get large and complex and full of elements. We shouldn't
  // render children until they are needed, i.e. until the menu is opened.
  // However, we must render the *menu itself* as early as possible, so that
  // `aria-owns` attributes can refer to it.
  return ReactDOM.createPortal(
    <S.Menu
      id={id}
      open={isOpen}
      aria-label={label}
      aria-activedescendant={focusedItem?.id}
      submenu={parentItem !== null}
      style={{zIndex: 100 + (openMenu?.depth ?? 0)}}
      onKeyDown={owner.onMenuKeyDown}
      onKeyPress={owner.onMenuKeyPress}
      ref={elemRef}
    >
      {isOpen &&
        <MenuContext.Provider value={menu}>
          {children}
        </MenuContext.Provider>
      }
    </S.Menu>,
    getContainer()
  );
};

OwnedMenu.displayName = 'OwnedMenu';

export default OwnedMenu;

const findFocusedItem = (
  stack: MenuStack,
  openMenu: OpenMenu | undefined
): RegisteredItem | null => {
  if (!openMenu) {
    return null;
  }

  // If the current item belongs to this menu, return it.
  if (stack.currentItem && stack.currentItem.parent === openMenu.menu) {
    return stack.currentItem;
  }
  // If this is not the last menu, we look at the *next* open menu to figure
  // out which of this menu's items is open.
  if (openMenu.depth < stack.openMenus.length - 1) {
    return stack.openMenus[openMenu.depth + 1].menu.parentItem;
  }
  return null;
};
