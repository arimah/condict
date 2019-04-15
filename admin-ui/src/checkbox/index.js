import React from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import combineRefs from '../combine-refs';

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
    inputRef,
    children,
    onChange,
    ...inputProps
  } = props;

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  // 'indeterminate' is not an HTML attribute; it can only be set via JS.
  // For that reason, styled-components does not forward it, and we have
  // to set it ourselves.
  const setIndeterminate = elem => {
    if (elem) {
      elem.indeterminate = indeterminate;
    }
  };

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
          ref={combineRefs(setIndeterminate, inputRef)}
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
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({current: PropTypes.any}),
  ]),
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
  inputRef: undefined,
  onChange: () => { },
};
