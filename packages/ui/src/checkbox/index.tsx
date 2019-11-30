import React, {
  ReactNode,
  Ref,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import combineRefs from '../combine-refs';
import Intent from '../intent';

import * as S from './styles';

export type Props = {
  indeterminate?: boolean;
  label?: string;
  labelProps?: Omit<
    LabelHTMLAttributes<HTMLLabelElement>,
    'className'
  >;
  inputRef?: Ref<HTMLInputElement>;
  children?: ReactNode;
} & Partial<S.IntentProps> & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-label' | 'type'
>;

export const Checkbox = (props: Props) => {
  const {
    className,
    intent = Intent.PRIMARY,
    indeterminate = false,
    label,
    disabled,
    labelProps,
    inputRef,
    children,
    // checked deliberately included here
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
      intent={intent}
    >
      <S.Input
        {...inputProps}
        intent={intent}
        disabled={disabled}
        aria-label={ariaLabel}
        ref={combineRefs(setIndeterminate, inputRef)}
      />
      <S.CheckmarkContainer>
        <S.IndeterminateMark/>
        <S.CheckMark/>
      </S.CheckmarkContainer>
      {renderedContent}
    </S.Label>
  );
};
