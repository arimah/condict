import React, {
  ChangeEventHandler,
  ReactNode,
  Ref,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import combineRefs from '../combine-refs';

import * as S from './styles';

export type Props = {
  className: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  label: string;
  name: string;
  labelProps: Omit<
    LabelHTMLAttributes<HTMLLabelElement>,
    'className'
  >;
  inputRef: Ref<HTMLInputElement>;
  onChange: ChangeEventHandler<HTMLInputElement>;
  children: ReactNode;
} & S.IntentProps & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-label' | 'checked' | 'className' | 'disabled' | 'name' | 'onChange' | 'type'
>;

export const Checkbox = (props: Props) => {
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
  const setIndeterminate = (elem: HTMLInputElement | null) => {
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
