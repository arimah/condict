import React, {ReactNode, useState, useRef, useContext} from 'react';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';

import genId from '@condict/gen-id';

import {useCommand} from '../command';
import {ShortcutType} from '../command/shortcut';
import combineRefs from '../combine-refs';

import * as S from './styles';
import ManagedMenu from './managed-menu';
import {StackContext, useNearestMenu} from './context';

export interface Props {
  label: string;
  icon?: ReactNode;
  shortcut?: ShortcutType | null;
  disabled?: boolean;
  command?: string | null;
  onActivate?: () => void;
  children?: ReactNode;
}

const DefaultOnActivate = () => { };

const Item = React.forwardRef<HTMLDivElement, Props>((
  props: Props,
  ref
) => {
  const {
    label,
    icon,
    shortcut,
    disabled = false,
    command: commandName,
    children,
    onActivate = DefaultOnActivate,
  } = props;

  const command = useCommand(commandName);
  const effectiveDisabled = command ? command.disabled : disabled;
  const effectiveShortcut = command ? command.shortcut : shortcut;

  const [ownId] = useState(genId);
  const ownRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<ManagedMenu>(null);
  const {hasFocus, submenuPlacement} = useNearestMenu(
    ownRef,
    submenuRef,
    label,
    effectiveDisabled,
    command ? command.exec : onActivate,
    () =>
      <PhantomItem
        label={label}
        icon={icon}
        shortcut={effectiveShortcut}
        hasSubmenu={!!children}
      />
  );
  const stack = useContext(StackContext);

  return <>
    <S.Item
      id={ownId}
      current={hasFocus}
      disabled={effectiveDisabled}
      role='menuitem'
      aria-disabled={effectiveDisabled ? 'true' : 'false'}
      aria-owns={children ? `${ownId}-menu` : undefined}
      aria-haspopup={children ? 'menu' : undefined}
      aria-keyshortcuts={
        effectiveShortcut
          ? effectiveShortcut.toAriaString()
          : undefined
      }
      ref={combineRefs(ref, ownRef)}
    >
      <S.ItemIcon>{icon}</S.ItemIcon>
      <S.ItemLabel>{label}</S.ItemLabel>
      <S.ItemShortcut>
        {effectiveShortcut && String(effectiveShortcut)}
      </S.ItemShortcut>
      <S.ItemSubmenu>
        {children != null && <ChevronRightIcon/>}
      </S.ItemSubmenu>
    </S.Item>
    {children && stack &&
      <ManagedMenu
        id={`${ownId}-menu`}
        name={label}
        stack={stack}
        placement={submenuPlacement}
        parentRef={ownRef}
        ref={submenuRef}
      >
        {children}
      </ManagedMenu>
    }
  </>;
});

Item.displayName = 'Item';

interface PhantomProps {
  icon: ReactNode;
  label: string;
  shortcut?: ShortcutType | null;
  hasSubmenu: boolean;
}

const PhantomItem = ({icon, label, shortcut, hasSubmenu}: PhantomProps) =>
  <S.Item aria-hidden='true'>
    <S.ItemIcon>{icon}</S.ItemIcon>
    <S.ItemLabel>{label}</S.ItemLabel>
    <S.ItemShortcut>
      {shortcut && String(shortcut)}
    </S.ItemShortcut>
    <S.ItemSubmenu>
      {hasSubmenu && <ChevronRightIcon/>}
    </S.ItemSubmenu>
  </S.Item>;

export default Item;
