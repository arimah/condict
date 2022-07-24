import {ReactNode, useContext, useRef} from 'react';

import {useUniqueId} from '../unique-id';
import {useCommand} from '../command';
import {Shortcut} from '../shortcut';

import {OwnerContext, useMenuItem} from './context';
import * as S from './styles';

export type Props = {
  label: string;
  icon?: ReactNode;
  shortcut?: Shortcut | null;
  checked?: boolean;
  radio?: boolean;
  disabled?: boolean;
  command?: string;
  onActivate?: () => void;
};

const DefaultOnActivate = () => { /* no-op */ };

const CheckItem = (props: Props): JSX.Element => {
  const {
    label,
    icon,
    shortcut = null,
    checked = false,
    radio = false,
    disabled = false,
    command: commandName,
    onActivate = DefaultOnActivate,
  } = props;

  const command = useCommand(commandName);
  const effectiveDisabled = command ? command.disabled || disabled : disabled;
  const effectiveShortcut = command ? command.shortcut : shortcut;

  const id = useUniqueId();
  const elemRef = useRef<HTMLDivElement>(null);

  const item = useMenuItem(
    id,
    elemRef,
    null,
    icon,
    label,
    shortcut,
    effectiveDisabled,
    command ? command.exec : onActivate,
    radio
      ? (checked ? 'radioOn' : 'radioOff')
      : (checked ? 'checkOn' : 'checkOff')
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const {stack} = useContext(OwnerContext)!;

  return (
    <S.Item
      id={id}
      current={item === stack.currentItem}
      disabled={effectiveDisabled}
      role={radio ? 'menuitemradio' : 'menuitemcheckbox'}
      aria-checked={checked}
      aria-disabled={effectiveDisabled}
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
      <S.ItemCheck checked={checked} radio={radio}/>
    </S.Item>
  );
};

export default CheckItem;
