import React, {ButtonHTMLAttributes, useRef} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';
import {ShortcutType} from '../command/shortcut';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';
import formatTooltip from './format-tooltip';
import * as S from './styles';

export type Props = {
  label?: string;
  checked?: boolean;
  shortcut?: ShortcutType | null;
  command?: string | null;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-label'
  | 'aria-pressed'
  | 'aria-keyshortcuts'
  | 'tabIndex'
  | 'title'
  | 'type'
>;

const Button = React.forwardRef<HTMLButtonElement, Props>((
  props: Props,
  ref
) => {
  const {
    checked,
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
      aria-label={ariaLabel}
      aria-pressed={checked != null ? checked : undefined}
      checked={checked}
      aria-keyshortcuts={
        effectiveShortcut
          ? effectiveShortcut.toAriaString()
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

Button.displayName = 'Button';

export default Button;
