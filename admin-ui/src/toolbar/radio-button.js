import React, {useContext, useRef} from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';
import {Shortcut, ShortcutGroup, ShortcutMap} from '../command/shortcut';
import combineRefs from '../combine-refs';

import {Context as FocusContext, useManagedFocus} from './focus-manager';
import formatTooltip from './format-tooltip';
import Group from './group';
import * as S from './styles';

const KeyboardMap = new ShortcutMap(
  [
    {
      key: Shortcut.parse('ArrowUp'),
      exec: ({descendants, currentFocus}, parent) => {
        const prev = descendants.getPreviousInParent(parent, currentFocus);
        if (prev) {
          prev.current.focus();
        }
      },
    },
    {
      key: Shortcut.parse('ArrowDown'),
      exec: ({descendants, currentFocus}, parent) => {
        const next = descendants.getNextInParent(parent, currentFocus);
        if (next) {
          next.current.focus();
        }
      },
    },
  ],
  cmd => cmd.key
);

export const RadioGroup = React.forwardRef((props, ref) => {
  const {
    children,
    ...otherProps
  } = props;

  const contextValue = useContext(FocusContext);
  const ownRef = useRef();

  return (
    <Group
      {...otherProps}
      role='radiogroup'
      onKeyDown={e => {
        const command = KeyboardMap.get(e);
        if (command) {
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

RadioGroup.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node.isRequired,
};

RadioGroup.defaultProps = {
  name: undefined,
};

const RadioButton = React.forwardRef((props, ref) => {
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
      role='radio'
      aria-label={ariaLabel}
      aria-checked={String(checked)}
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

RadioButton.propTypes = {
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

RadioButton.defaultProps = {
  className: '',
  checked: false,
  label: '',
  shortcut: null,
  disabled: false,
  command: null,
  onClick: null,
};

export default RadioButton;
