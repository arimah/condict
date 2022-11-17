import React, {
  Ref,
  RefObject,
  ButtonHTMLAttributes,
  useContext,
  useRef,
} from 'react';

import {useCommand} from '../command';
import {Shortcut, ShortcutMap} from '../shortcut';
import {Descendants} from '../descendants';
import combineRefs from '../combine-refs';

import {
  Context as FocusContext,
  ContextValue,
  ItemElement,
  useManagedFocus,
} from './focus-manager';
import useTooltip from './tooltip';
import Group, {Props as GroupBaseProps} from './group';
import * as S from './styles';

type KeyCommand = {
  key: Shortcut | null;
  exec(context: ContextValue, parent: HTMLDivElement): void;
};

const isEnabledInParent = (
  parent: HTMLDivElement,
  item: RefObject<ItemElement>
): boolean =>
  item.current !== null &&
  !item.current.disabled &&
  parent.contains(item.current);

const KeyboardMap = new ShortcutMap<KeyCommand>(
  [
    {
      key: Shortcut.parse('ArrowUp'),
      exec({descendants, activeChild}, parent) {
        const prev =
          activeChild &&
          activeChild.current &&
          Descendants.prevWrapping(
            descendants,
            activeChild,
            item => isEnabledInParent(parent, item)
          );
        if (prev && prev.current) {
          prev.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse('ArrowDown'),
      exec({descendants, activeChild}, parent) {
        const next =
          activeChild &&
          activeChild.current &&
          Descendants.nextWrapping(
            descendants,
            activeChild,
            item => isEnabledInParent(parent, item)
          );
        if (next && next.current) {
          next.current.focus();
        }
      },
    },
  ],
  cmd => cmd.key
);

export type GroupProps = Omit<GroupBaseProps, 'onKeyDown' | 'role'>;

export const RadioGroup = React.forwardRef((
  props: GroupProps,
  ref: Ref<HTMLDivElement>
) => {
  const {
    children,
    ...otherProps
  } = props;

  const contextValue = useContext(FocusContext);
  const ownRef = useRef<HTMLDivElement>(null);

  return (
    <Group
      {...otherProps}
      role='radiogroup'
      onKeyDown={e => {
        const command = KeyboardMap.get(e);
        if (command && contextValue && ownRef.current) {
          e.preventDefault();
          e.stopPropagation();
          command.exec(contextValue, ownRef.current);
        }
      }}
      ref={combineRefs(ref, ownRef)}
    >
      {children}
    </Group>
  );
});

RadioGroup.displayName = 'RadioGroup';

export type Props = {
  checked?: boolean;
  shortcut?: Shortcut | null;
  command?: string | null;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-checked'
  | 'aria-keyshortcuts'
  | 'role'
  | 'tabIndex'
  | 'type'
>;

const RadioButton = React.forwardRef((
  props: Props,
  ref: Ref<HTMLButtonElement>
) => {
  const {
    checked = false,
    shortcut,
    disabled,
    command: commandName,
    'aria-label': ariaLabel,
    title = null,
    onClick,
    children,
    ...otherProps
  } = props;

  const command = useCommand(commandName);
  const ownRef = useRef<HTMLButtonElement>(null);
  const isCurrent = useManagedFocus(ownRef);

  const effectiveShortcut = command ? command.shortcut : shortcut;
  const effectiveTitle = useTooltip(title, effectiveShortcut);

  return (
    <S.Button
      {...otherProps}
      role='radio'
      aria-label={ariaLabel ?? title ?? undefined}
      aria-checked={checked}
      $checked={checked}
      aria-keyshortcuts={
        effectiveShortcut
          ? Shortcut.formatAria(effectiveShortcut)
          : undefined
      }
      tabIndex={isCurrent ? 0 : -1}
      title={effectiveTitle}
      disabled={command ? command.disabled || disabled : disabled}
      onClick={command ? command.exec : onClick}
      ref={combineRefs(ref, ownRef)}
    >
      {children}
    </S.Button>
  );
});

RadioButton.displayName = 'RadioButton';

export default RadioButton;
