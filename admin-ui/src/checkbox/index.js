import React from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import * as S from './styles';

export const Checkbox = props => {
  const {
    className,
    intent,
    checked,
    indeterminate,
    label,
    disabled,
    name,
    labelProps,
    children,
    onChange,
    ...inputProps
  } = props;

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  // 'indeterminate' is not an HTML attribute; it can only be set via JS.
  // For that reason, styled-components does not forward it, and we have
  // to set it ourselves.

  return (
    <S.Label
      {...labelProps}
      className={className}
      disabled={disabled}
    >
      <S.CheckmarkContainer
        intent={intent}
        checked={checked || indeterminate}
        disabled={disabled}
      >
        <S.IndeterminateMark checked={indeterminate}/>
        <S.CheckMark checked={checked}/>
        <S.Input
          {...inputProps}
          name={name}
          disabled={disabled}
          checked={!!checked}
          aria-label={ariaLabel}
          onChange={onChange}
          ref={elem => elem && (elem.indeterminate = indeterminate)}
        />
      </S.CheckmarkContainer>
      {renderedContent}
    </S.Label>
  );
};

Checkbox.propTypes = {
  className: PropTypes.string,
  intent: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  labelProps: PropTypes.object,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

Checkbox.defaultProps = {
  className: '',
  intent: 'primary',
  checked: false,
  indeterminate: false,
  disabled: false,
  label: '',
  name: undefined,
  labelProps: null,
  onChange: () => { },
};
