import {ReactNode, useContext, useRef} from 'react';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';

import {useUniqueId} from '../unique-id';
import {useCommand} from '../command';
import {Shortcut} from '../shortcut';

import OwnedMenu from './owned-menu';
import {OwnerContext, useMenuItem} from './context';
import {RegisteredMenu} from './types';
import * as S from './styles';

export type Props = {
  label: string;
  icon?: ReactNode;
  shortcut?: Shortcut | null;
  disabled?: boolean;
  command?: string;
  onActivate?: () => void;
  children?: ReactNode;
};

const DefaultOnActivate = () => { /* no-op */ };

const Item = (props: Props): JSX.Element => {
  const {
    label,
    icon,
    shortcut = null,
    disabled = false,
    command: commandName,
    children,
    onActivate = DefaultOnActivate,
  } = props;

  const command = useCommand(commandName);
  const effectiveDisabled = command ? command.disabled || disabled : disabled;
  const effectiveShortcut = command ? command.shortcut : shortcut;

  const id = useUniqueId();
  const elemRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<RegisteredMenu>(null);

  const item = useMenuItem(
    id,
    elemRef,
    submenuRef,
    icon,
    label,
    shortcut,
    effectiveDisabled,
    command ? command.exec : onActivate,
    'none'
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const {stack} = useContext(OwnerContext)!;

  // The item is focused in one of two circumstances:
  //
  // 1. If the current item is in the parent menu, we mark as focused if the
  //    currentItem is the same as item.
  // 2. Otherwise, the item is focused if its submenu is open.
  //
  // Note that if a different item in this menu is hovered, then we never
  // mark this item as focused.
  const hasFocus =
    stack.currentItem && stack.currentItem.parent === item.parent
      ? item === stack.currentItem
      : stack.openMenus.some(m => m.menu === item.submenu);
  // The submenu is open if there's any open menu whose parent item is
  // the current item.
  const submenuOpen = stack.openMenus.some(m => m.menu.parentItem === item);

  return <>
    <S.Item
      id={id}
      current={hasFocus}
      disabled={effectiveDisabled}
      role='menuitem'
      aria-disabled={effectiveDisabled}
      aria-owns={children ? `${id}-menu` : undefined}
      aria-haspopup={children ? 'menu' : undefined}
      aria-expanded={children ? submenuOpen : undefined}
      aria-keyshortcuts={
        effectiveShortcut
          ? Shortcut.formatAria(effectiveShortcut)
          : undefined
      }
      ref={elemRef}
    >
      <S.ItemIcon>{icon}</S.ItemIcon>
      <S.ItemLabel>{label}</S.ItemLabel>
      {effectiveShortcut &&
        <S.ItemShortcut>
          {Shortcut.format(effectiveShortcut)}
        </S.ItemShortcut>
      }
      <S.ItemSubmenu>
        {children != null && <ChevronRightIcon className='rtl-mirror'/>}
      </S.ItemSubmenu>
    </S.Item>
    {children &&
      <OwnedMenu
        id={`${id}-menu`}
        label={label}
        parentItem={item}
        privateRef={submenuRef}
      >
        {children}
      </OwnedMenu>
    }
  </>;
};

export default Item;
