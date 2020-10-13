import React, {ReactNode, Ref, useRef} from 'react';

import {useCommand} from '../command';
import {Shortcut} from '../shortcut';
import combineRefs from '../combine-refs';
import {useUniqueId} from '../unique-id';

import * as S from './styles';
import {useNearestMenu} from './context';

export type Props = {
  label: string;
  icon?: ReactNode;
  shortcut?: Shortcut | null;
  checked?: boolean;
  radio?: boolean;
  disabled?: boolean;
  command?: string | null;
  onActivate?: () => void;
};

const DefaultOnActivate = () => { /* no-op */ };

const CheckItem = React.forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
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
  const effectiveDisabled = command ? command.disabled || disabled : disabled;
  const effectiveShortcut = command ? command.shortcut : shortcut;

  const ownId = useUniqueId();
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
      aria-checked={checked}
      aria-disabled={effectiveDisabled}
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
  shortcut?: Shortcut | null;
  checked: boolean;
  radio: boolean;
};

const PhantomItem = ({icon, label, shortcut, checked, radio}: PhantomProps) =>
  <S.Item aria-hidden='true'>
    <S.ItemIcon>{icon}</S.ItemIcon>
    <S.ItemLabel>{label}</S.ItemLabel>
    {shortcut &&
      <S.ItemShortcut>
        {Shortcut.format(shortcut)}
      </S.ItemShortcut>}
    <S.ItemCheck checked={checked} radio={radio}>
      {checked && (radio ? <S.RadioDot/> : <S.CheckMark/>)}
    </S.ItemCheck>
  </S.Item>;

export default CheckItem;
