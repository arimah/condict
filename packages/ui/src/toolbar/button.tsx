import React, {Ref, ButtonHTMLAttributes, useRef} from 'react';

import {useCommand} from '../command';
import {Shortcut} from '../shortcut';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';
import useTooltip from './tooltip';
import * as S from './styles';

export type Props = {
  checked?: boolean;
  shortcut?: Shortcut | null;
  command?: string | null;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'aria-pressed'
  | 'aria-keyshortcuts'
  | 'tabIndex'
  | 'type'
>;

const Button = React.forwardRef((
  props: Props,
  ref: Ref<HTMLButtonElement>
) => {
  const {
    checked,
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
      aria-label={ariaLabel ?? title ?? undefined}
      aria-pressed={checked != null ? checked : undefined}
      checked={checked}
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

Button.displayName = 'Button';

export default Button;
