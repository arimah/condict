import React from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import * as S from './styles';

export const Switch = props => {
  const {
    className,
    intent,
    checked,
    label,
    disabled,
    name,
    labelProps,
    inputProps,
    children,
    onChange,
  } = props;

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  // Note: The best role for a switch would be 'switch', but browser support
  // for that role is spotty at best. In practice, a toggle button seems to
  // work better.
  return (
    <S.Label
      {...labelProps}
      className={className}
      disabled={disabled}
    >
      <S.SwitchContainer>
        <S.Switch
          disabled={disabled}
          intent={intent}
          checked={checked}
        >
          <S.Dot
            disabled={disabled}
            intent={intent}
            checked={checked}
          />
        </S.Switch>
        <S.Input
          {...inputProps}
          name={name}
          disabled={disabled}
          checked={checked}
          role='button'
          aria-pressed={String(checked)}
          aria-label={ariaLabel}
          onChange={onChange}
        />
      </S.SwitchContainer>
      {renderedContent}
    </S.Label>
  );
};

Switch.propTypes = {
  className: PropTypes.string,
  intent: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  labelProps: PropTypes.object,
  inputProps: PropTypes.object,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

Switch.defaultProps = {
  className: '',
  intent: 'primary',
  checked: false,
  disabled: false,
  label: '',
  name: undefined,
  labelProps: null,
  inputProps: null,
  onChange: () => { },
};
