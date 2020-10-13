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
import {getContentAndLabel} from '../a11y-utils';
import combineRefs from '../combine-refs';

import {
  Context as FocusContext,
  ContextValue,
  ItemElement,
  useManagedFocus,
} from './focus-manager';
import formatTooltip from './format-tooltip';
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
      exec({descendants, currentFocus}, parent) {
        const prev =
          currentFocus &&
          currentFocus.current &&
          Descendants.prevWrapping(
            descendants,
            currentFocus,
            item => isEnabledInParent(parent, item)
          );
        if (prev && prev.current) {
          prev.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse('ArrowDown'),
      exec({descendants, currentFocus}, parent) {
        const next =
          currentFocus &&
          currentFocus.current &&
          Descendants.nextWrapping(
            descendants,
            currentFocus,
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
  label?: string;
  shortcut?: Shortcut | null;
  command?: string | null;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-checked'
  | 'aria-keyshortcuts'
  | 'aria-label'
  | 'role'
  | 'tabIndex'
  | 'title'
  | 'type'
>;

const RadioButton = React.forwardRef((
  props: Props,
  ref: Ref<HTMLButtonElement>
) => {
  const {
    checked = false,
    label = '',
    shortcut,
    disabled,
    command: commandName,
    onClick,
    children,
    ...otherProps
  } = props;

  const command = useCommand(commandName);
  const ownRef = useRef<HTMLButtonElement>(null);
  const isCurrent = useManagedFocus(ownRef);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  const effectiveShortcut = command ? command.shortcut : shortcut;

  return (
    <S.Button
      {...otherProps}
      role='radio'
      aria-label={ariaLabel}
      aria-checked={checked}
      checked={checked}
      aria-keyshortcuts={
        effectiveShortcut
          ? Shortcut.formatAria(effectiveShortcut)
          : undefined
      }
      tabIndex={isCurrent ? 0 : -1}
      title={formatTooltip(label, effectiveShortcut)}
      disabled={command ? command.disabled || disabled : disabled}
      onClick={command ? command.exec : onClick}
      ref={combineRefs(ref, ownRef)}
    >
      {renderedContent}
    </S.Button>
  );
});

RadioButton.displayName = 'RadioButton';

export default RadioButton;
