import React, {ReactNode} from 'react';
import {
  FieldValues,
  FieldPath,
  FieldError,
  get,
  useFormContext,
} from 'react-hook-form';

import {TextInputProps, useUniqueId} from '@condict/ui';

import {Validators} from './types';
import * as S from './styles';
import getErrorMessage from './error-message';

export type Props<D extends FieldValues> = {
  name: FieldPath<D>;
  label?: ReactNode;
  validate?: Validators<string>;
  defaultError?: ReactNode;
  errorMessages?: Record<string, ReactNode>;
} & Omit<
  TextInputProps,
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'form'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
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
    ...otherProps
  } = props;

  const autoId = useUniqueId();
  const {register, formState} = useFormContext();
  const {touchedFields, errors, isSubmitting} = formState;

  const field = register(name, {
    required: otherProps.required,
    minLength: otherProps.minLength,
    maxLength: otherProps.maxLength,
    validate,
  });

  const touched = !!get(touchedFields, name, false);

  const fieldError = get(errors, name) as FieldError | undefined;
  const errorMessage = fieldError && getErrorMessage(
    fieldError,
    errorMessages,
    defaultError
  );

  return (
    <S.Field>
      {label &&
        <S.Label htmlFor={id || autoId}>
          {label}
        </S.Label>}
      <S.TextInput
        {...otherProps}
        {...field}
        id={id || autoId}
        aria-describedby={fieldError ? `${autoId}-error` : undefined}
        readOnly={isSubmitting}
        $touched={touched}
        $invalid={Boolean(fieldError)}
      />
      {errorMessage &&
        <S.ErrorMessage id={`${autoId}-error`}>
          {errorMessage}
        </S.ErrorMessage>}
    </S.Field>
  );
}) as TextFieldComponent;
