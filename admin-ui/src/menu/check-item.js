import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';

import genId from '@condict/gen-id';

import {useCommand} from '../command';
import {Shortcut, ShortcutGroup} from '../command/shortcut';
import combineRefs from '../combine-refs';

import * as S from './styles';
import {useNearestMenu} from './context';

const CheckItem = React.forwardRef((props, ref) => {
  const {
    label,
    icon,
    shortcut,
    command: commandName,
    checked,
    radio,
    disabled,
    onActivate,
  } = props;

  const command = useCommand(commandName);
  const effectiveDisabled = command ? command.disabled : disabled;

  const [ownId] = useState(genId);
  const ownRef = useRef();
  const {hasFocus} = useNearestMenu(
    ownRef,
    null,
    effectiveDisabled,
    command ? command.exec : onActivate
  );

  return (
    <S.Item
      id={ownId}
      current={hasFocus}
      disabled={effectiveDisabled}
      role={radio ? 'menuitemradio' : 'menuitemcheckbox'}
      aria-checked={String(checked)}
      aria-disabled={String(effectiveDisabled)}
      ref={combineRefs(ref, ownRef)}
    >
      <S.ItemIcon>{icon}</S.ItemIcon>
      <S.ItemLabel>{label}</S.ItemLabel>
      <S.ItemShortcut>{shortcut && String(shortcut)}</S.ItemShortcut>
      <S.ItemCheck checked={checked} radio={radio}>
        {checked && (radio ? <S.RadioDot/> : <S.CheckMark/>)}
      </S.ItemCheck>
    </S.Item>
  );
});
CheckItem.displayName = 'CheckItem';

CheckItem.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.element,
  shortcut: PropTypes.oneOfType([
    PropTypes.instanceOf(Shortcut),
    PropTypes.instanceOf(ShortcutGroup),
  ]),
  checked: PropTypes.bool,
  radio: PropTypes.bool,
  command: PropTypes.string,
  disabled: PropTypes.bool,
  onActivate: PropTypes.func,
};

CheckItem.defaultProps = {
  icon: null,
  shortcut: null,
  checked: false,
  radio: false,
  command: null,
  disabled: false,
  onActivate: () => { },
};

export default CheckItem;
