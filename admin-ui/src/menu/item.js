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
    command: commandName,
    children,
    disabled,
    onActivate,
  } = props;

  const command = useCommand(commandName);
  const effectiveDisabled = command ? command.disabled : disabled;

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
      ref={combineRefs(ref, ownRef)}
    >
      <S.ItemIcon>{icon}</S.ItemIcon>
      <S.ItemLabel>{label}</S.ItemLabel>
      <S.ItemShortcut>{shortcut && String(shortcut)}</S.ItemShortcut>
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
  icon: PropTypes.element,
  shortcut: PropTypes.oneOfType([
    PropTypes.instanceOf(Shortcut),
    PropTypes.instanceOf(ShortcutGroup),
  ]),
  command: PropTypes.string,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  onActivate: PropTypes.func,
};

Item.defaultProps = {
  icon: null,
  shortcut: null,
  command: null,
  children: null,
  disabled: false,
  onActivate: () => { },
};

export default Item;
