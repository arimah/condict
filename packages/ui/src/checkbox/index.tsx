import {
  ReactNode,
  Ref,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from 'react';

import {getContentAndLabel} from '../a11y-utils';
import MarkerLocation from '../marker-location';
import combineRefs from '../combine-refs';

import * as S from './styles';

export type Props = {
  indeterminate?: boolean;
  label?: string;
  labelProps?: Omit<
    LabelHTMLAttributes<HTMLLabelElement>,
    'className'
  >;
  marker?: MarkerLocation;
  inputRef?: Ref<HTMLInputElement>;
  children?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-label' | 'type'
>;

export const Checkbox = (props: Props): JSX.Element => {
  const {
    className,
    indeterminate = false,
    label,
    disabled,
    labelProps,
    marker = 'before',
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
      marker={marker}
    >
      <S.Input
        {...inputProps}
        disabled={disabled}
        aria-label={ariaLabel}
        ref={combineRefs(setIndeterminate, inputRef)}
      />
      <S.CheckmarkContainer>
        <S.IndeterminateMark/>
        <S.CheckMark/>
      </S.CheckmarkContainer>
      <S.Content>{renderedContent}</S.Content>
    </S.Label>
  );
};

Checkbox.Content = S.Content;
