import React, {ReactNode, Ref, useRef} from 'react';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';

import {useCommand} from '../command';
import {Shortcut} from '../shortcut';
import combineRefs from '../combine-refs';
import {useUniqueId} from '../unique-id';

import * as S from './styles';
import ManagedMenu from './managed-menu';
import {useManagedTree, useNearestMenu} from './context';

export type Props = {
  label: string;
  icon?: ReactNode;
  shortcut?: Shortcut | null;
  disabled?: boolean;
  command?: string | null;
  onActivate?: () => void;
  children?: ReactNode;
};

const DefaultOnActivate = () => { /* no-op */ };

const Item = React.forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
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
  const effectiveDisabled = command ? command.disabled || disabled : disabled;
  const effectiveShortcut = command ? command.shortcut : shortcut;

  const ownId = useUniqueId();
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
  const tree = useManagedTree();

  return <>
    <S.Item
      id={ownId}
      current={hasFocus}
      disabled={effectiveDisabled}
      role='menuitem'
      aria-disabled={effectiveDisabled}
      aria-owns={children ? `${ownId}-menu` : undefined}
      aria-haspopup={children ? 'menu' : undefined}
      aria-keyshortcuts={
        effectiveShortcut
          ? Shortcut.formatAria(effectiveShortcut)
          : undefined
      }
      ref={combineRefs(ref, ownRef)}
    >
      <S.ItemIcon>{icon}</S.ItemIcon>
      <S.ItemLabel>{label}</S.ItemLabel>
      {effectiveShortcut &&
        <S.ItemShortcut>
          {Shortcut.format(effectiveShortcut)}
        </S.ItemShortcut>}
      <S.ItemSubmenu>
        {children != null && <ChevronRightIcon/>}
      </S.ItemSubmenu>
    </S.Item>
    {children &&
      <ManagedMenu
        id={`${ownId}-menu`}
        name={label}
        stack={tree.stack}
        manager={tree.manager}
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

type PhantomProps = {
  icon: ReactNode;
  label: string;
  shortcut?: Shortcut | null;
  hasSubmenu: boolean;
};

const PhantomItem = ({icon, label, shortcut, hasSubmenu}: PhantomProps) =>
  <S.Item aria-hidden='true'>
    <S.ItemIcon>{icon}</S.ItemIcon>
    <S.ItemLabel>{label}</S.ItemLabel>
    {shortcut &&
      <S.ItemShortcut>
        {Shortcut.format(shortcut)}
      </S.ItemShortcut>}
    <S.ItemSubmenu>
      {hasSubmenu && <ChevronRightIcon/>}
    </S.ItemSubmenu>
  </S.Item>;

export default Item;
