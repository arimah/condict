import React, {useRef} from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';
import {Shortcut, ShortcutGroup} from '../command/shortcut';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';
import formatTooltip from './format-tooltip';
import * as S from './styles';

const Button = React.forwardRef((props, ref) => {
  const {
    className,
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
  const ownRef = useRef();
  const isCurrent = useManagedFocus(ownRef);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  const effectiveShortcut = command ? command.shortcut : shortcut;

  return (
    <S.Button
      {...otherProps}
      className={className}
      aria-label={ariaLabel}
      aria-pressed={checked != null ? String(checked) : undefined}
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

Button.displayName = 'Button';

Button.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  label: PropTypes.string,
  shortcut: PropTypes.oneOfType([
    PropTypes.instanceOf(Shortcut),
    PropTypes.instanceOf(ShortcutGroup),
  ]),
  disabled: PropTypes.bool,
  command: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

Button.defaultProps = {
  className: '',
  checked: undefined,
  label: '',
  shortcut: null,
  disabled: false,
  command: null,
  onClick: null,
};

export default Button;
