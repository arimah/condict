import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';

import genId from '@condict/gen-id';

import {useCommand} from '../command';
import {Shortcut, ShortcutGroup} from '../command/shortcut';
import combineRefs from '../combine-refs';

import * as S from './styles';
import {Menu} from '.';
import {useNearestMenu} from './context';

const Item = React.forwardRef((props, ref) => {
  const {
    label,
    icon,
    shortcut,
    disabled,
    command: commandName,
    children,
    onActivate,
  } = props;

  const command = useCommand(commandName);
  const effectiveDisabled = command ? command.disabled : disabled;
  const effectiveShortcut = command ? command.shortcut : shortcut;

  const [ownId] = useState(genId);
  const ownRef = useRef();
  const submenuRef = useRef();
  const {hasFocus, submenuPlacement} = useNearestMenu(
    ownRef,
    submenuRef,
    effectiveDisabled,
    command ? command.exec : onActivate
  );

  return <>
    <S.Item
      id={ownId}
      current={hasFocus}
      disabled={effectiveDisabled}
      role='menuitem'
      aria-disabled={String(effectiveDisabled)}
      aria-owns={children ? `${ownId}-menu` : undefined}
      aria-haspopup={children ? 'menu' : undefined}
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
      <S.ItemSubmenu>
        {children != null && <ChevronRightIcon/>}
      </S.ItemSubmenu>
    </S.Item>
    {children &&
      <Menu
        id={`${ownId}-menu`}
        name={label}
        placement={submenuPlacement}
        parentRef={ownRef}
        ref={submenuRef}
      >
        {children}
      </Menu>
    }
  </>;
});
Item.displayName = 'Item';

Item.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  shortcut: PropTypes.oneOfType([
    PropTypes.instanceOf(Shortcut),
    PropTypes.instanceOf(ShortcutGroup),
  ]),
  disabled: PropTypes.bool,
  command: PropTypes.string,
  children: PropTypes.node,
  onActivate: PropTypes.func,
};

Item.defaultProps = {
  icon: null,
  shortcut: null,
  disabled: false,
  command: null,
  children: undefined,
  onActivate: () => { },
};

export default Item;
