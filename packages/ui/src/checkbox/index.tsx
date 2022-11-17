import {ReactNode, Ref, InputHTMLAttributes} from 'react';

import MarkerLocation from '../marker-location';
import combineRefs from '../combine-refs';

import * as S from './styles';

export type Props = {
  indeterminate?: boolean;
  marker?: MarkerLocation;
  inputRef?: Ref<HTMLInputElement>;
  children?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
>;

export const Checkbox = (props: Props): JSX.Element => {
  const {
    className,
    indeterminate = false,
    disabled,
    marker = 'before',
    inputRef,
    children,
    // checked deliberately included here
    ...inputProps
  } = props;

  // 'indeterminate' is not an HTML attribute; it can only be set via JS.
  // For that reason, styled-components does not forward it, and we have
  // to set it ourselves.
  const setIndeterminate = (elem: HTMLInputElement | null) => {
    if (elem) {
      elem.indeterminate = indeterminate;
    }
  };

  return (
    <S.Label className={className} $marker={marker} $disabled={disabled}>
      <S.Input
        {...inputProps}
        disabled={disabled}
        ref={combineRefs(setIndeterminate, inputRef)}
      />
      <S.CheckmarkContainer>
        <S.IndeterminateMark/>
        <S.CheckMark/>
      </S.CheckmarkContainer>
      <S.Content>{children}</S.Content>
    </S.Label>
  );
};

Checkbox.Content = S.Content;
