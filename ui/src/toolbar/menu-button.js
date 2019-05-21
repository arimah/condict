import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import MenuTrigger from '../menu/trigger';
import combineRefs from '../combine-refs';

import {useManagedFocus} from './focus-manager';
import formatTooltip from './format-tooltip';
import * as S from './styles';

const MenuButton = React.forwardRef((props, ref) => {
  const {
    className,
    disabled,
    label,
    menu,
    children,
    ...otherProps
  } = props;

  const ownRef = useRef();
  const isCurrent = useManagedFocus(ownRef);
  const [open, setOpen] = useState(false);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <MenuTrigger menu={menu} onToggle={setOpen}>
      <S.Button
        {...otherProps}
        className={className}
        aria-label={ariaLabel}
        checked={open}
        tabIndex={isCurrent ? 0 : -1}
        title={formatTooltip(label, null)}
        disabled={disabled}
        ref={combineRefs(ref, ownRef)}
      >
        {renderedContent}
      </S.Button>
    </MenuTrigger>
  );
});
MenuButton.displayName = 'MenuButton';

MenuButton.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  menu: PropTypes.element.isRequired,
  children: PropTypes.node,
};

MenuButton.defaultProps = {
  className: '',
  disabled: false,
  label: '',
};

export default MenuButton;
