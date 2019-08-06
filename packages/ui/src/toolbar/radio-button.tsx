import React, {ButtonHTMLAttributes, useContext, useRef} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';
import {Shortcut, ShortcutMap, ShortcutType} from '../command/shortcut';
import combineRefs from '../combine-refs';

import {Context as FocusContext, ContextValue, useManagedFocus} from './focus-manager';
import formatTooltip from './format-tooltip';
import Group, {Props as GroupBaseProps} from './group';
import * as S from './styles';

interface KeyCommand {
  key: ShortcutType | null;
  exec(context: ContextValue, parent: HTMLDivElement): void;
}

const KeyboardMap = new ShortcutMap<KeyCommand>(
  [
    {
      key: Shortcut.parse('ArrowUp'),
      exec({descendants, currentFocus}, parent) {
        const prev =
          currentFocus &&
          currentFocus.current &&
          descendants.getPreviousInParent(parent, currentFocus);
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
          descendants.getNextInParent(parent, currentFocus);
        if (next && next.current) {
          next.current.focus();
        }
      },
    },
  ],
  cmd => cmd.key
);

export type GroupProps = Omit<GroupBaseProps, 'onKeyDown'>;

export const RadioGroup = React.forwardRef<HTMLDivElement, GroupProps>((
  props: GroupProps,
  ref
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
  checked: boolean;
  label: string;
  shortcut: ShortcutType | null;
  command?: string | null;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-checked' | 'aria-keyshortcuts' | 'aria-label' | 'role' | 'tabIndex'
>;

const RadioButton = React.forwardRef<HTMLButtonElement, Props>((
  props: Props,
  ref
) => {
  const {
    checked,
    label,
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
      aria-checked={String(checked) as 'true' | 'false'}
      checked={checked}
      aria-keyshortcuts={
        effectiveShortcut
          ? effectiveShortcut.toAriaString()
          : undefined
      }
      tabIndex={isCurrent ? 0 : -1}
      title={formatTooltip(label, effectiveShortcut)}
      disabled={command ? command.disabled : disabled}
      onClick={command ? command.exec : onClick}
      ref={combineRefs(ref, ownRef)}
    >
      {renderedContent}
    </S.Button>
  );
});

RadioButton.displayName = 'RadioButton';

RadioButton.defaultProps = {
  checked: false,
  label: '',
  shortcut: null,
};

export default RadioButton;
