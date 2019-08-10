import React, {ReactNode, useState, useRef} from 'react';

import genId from '@condict/gen-id';

import {useCommand} from '../command';
import {ShortcutType} from '../command/shortcut';
import combineRefs from '../combine-refs';

import * as S from './styles';
import {useNearestMenu} from './context';

export type Props = {
  label: string;
  icon?: ReactNode;
  shortcut?: ShortcutType | null;
  checked?: boolean;
  radio?: boolean;
  disabled?: boolean;
  command?: string | null;
  onActivate?: () => void;
};

const DefaultOnActivate = () => {};

const CheckItem = React.forwardRef<HTMLDivElement, Props>((
  props: Props,
  ref
) => {
  const {
    label,
    icon,
    shortcut,
    checked = false,
    radio = false,
    disabled = false,
    command: commandName,
    onActivate = DefaultOnActivate,
  } = props;

  const command = useCommand(commandName);
  const effectiveDisabled = command ? command.disabled : disabled;
  const effectiveShortcut = command ? command.shortcut : shortcut;

  const [ownId] = useState(genId);
  const ownRef = useRef<HTMLDivElement>(null);
  const {hasFocus} = useNearestMenu(
    ownRef,
    null,
    label,
    effectiveDisabled,
    command ? command.exec : onActivate,
    () =>
      <PhantomItem
        label={label}
        icon={icon}
        shortcut={effectiveShortcut}
        checked={checked}
        radio={radio}
      />
  );

  return (
    <S.Item
      id={ownId}
      current={hasFocus}
      disabled={effectiveDisabled}
      role={radio ? 'menuitemradio' : 'menuitemcheckbox'}
      aria-checked={checked ? 'true' : 'false'}
      aria-disabled={effectiveDisabled ? 'true' : 'false'}
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
      <S.ItemCheck checked={checked} radio={radio}>
        {checked && (radio ? <S.RadioDot/> : <S.CheckMark/>)}
      </S.ItemCheck>
    </S.Item>
  );
});

CheckItem.displayName = 'CheckItem';

type PhantomProps = {
  icon: ReactNode;
  label: string;
  shortcut?: ShortcutType | null;
  checked: boolean;
  radio: boolean;
};

const PhantomItem = ({icon, label, shortcut, checked, radio}: PhantomProps) =>
  <S.Item aria-hidden='true'>
    <S.ItemIcon>{icon}</S.ItemIcon>
    <S.ItemLabel>{label}</S.ItemLabel>
    <S.ItemShortcut>
      {shortcut && String(shortcut)}
    </S.ItemShortcut>
    <S.ItemCheck checked={checked} radio={radio}>
      {checked && (radio ? <S.RadioDot/> : <S.CheckMark/>)}
    </S.ItemCheck>
  </S.Item>;

export default CheckItem;
