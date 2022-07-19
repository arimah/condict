import React, {ReactNode, Ref} from 'react';
import {
  FieldValues,
  FieldPath,
  FieldError,
  get,
  useFormContext,
} from 'react-hook-form';

import {TextInputProps, useUniqueId, combineRefs} from '@condict/ui';

import {Validators} from './types';
import * as S from './styles';
import getErrorMessage from './error-message';

export type Props<D extends FieldValues> = {
  name: FieldPath<D>;
  label?: ReactNode;
  validate?: Validators<string>;
  defaultError?: ReactNode;
  errorMessages?: Record<string, ReactNode>;
  inputRef?: Ref<HTMLInputElement>;
} & Omit<
  TextInputProps,
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'form'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-invalid'
>;

export type TextFieldComponent = <D extends FieldValues>(
  props: Props<D>
) => JSX.Element;

// eslint-disable-next-line react/display-name
export const TextField = React.memo((
  props: Props<FieldValues>
): JSX.Element => {
  const {
    id,
    name,
    validate,
    label,
    defaultError,
    errorMessages,
    inputRef,
    ...otherProps
  } = props;

  const autoId = useUniqueId();
  const {register, formState} = useFormContext();
  const {errors, isSubmitting} = formState;

  const {ref: fieldRef, ...field} = register(name, {
    required: otherProps.required,
    minLength: otherProps.minLength,
    maxLength: otherProps.maxLength,
    validate,
  });

  const fieldError = get(errors, name) as FieldError | undefined;
  const errorMessage = fieldError && getErrorMessage(
    fieldError,
    errorMessages,
    defaultError
  );

  return (
    <S.Field>
      {label &&
        <S.Label htmlFor={id ?? autoId}>
          {label}
        </S.Label>}
      <S.TextInput
        {...otherProps}
        {...field}
        id={id ?? autoId}
        aria-describedby={fieldError ? `${autoId}-error` : undefined}
        aria-invalid={Boolean(fieldError)}
        readOnly={isSubmitting}
        $invalid={Boolean(fieldError)}
        ref={combineRefs(inputRef, fieldRef)}
      />
      {errorMessage &&
        <S.ErrorMessage id={`${autoId}-error`}>
          {errorMessage}
        </S.ErrorMessage>}
    </S.Field>
  );
}) as TextFieldComponent;
