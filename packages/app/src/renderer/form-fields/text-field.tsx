import React, {ReactNode, Ref, useRef} from 'react';

import {TextInputProps, useUniqueId, combineRefs} from '@condict/ui';

import {Validators, useNearestForm, useField, useFormState} from '../form';

import * as S from './styles';

export type Props = {
  name: string;
  path?: string;
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
  | 'minLength'
  | 'maxLength'
  | 'aria-label'
  | 'aria-describedby'
  | 'aria-invalid'
  | 'onChange'
>;

// eslint-disable-next-line react/display-name
export const TextField = React.memo((props: Props): JSX.Element => {
  const {
    id,
    name,
    path,
    validate,
    label,
    readOnly,
    defaultError,
    errorMessages,
    className,
    inputRef,
    ...otherProps
  } = props;

  const form = useNearestForm();

  const autoId = useUniqueId();
  const ownRef = useRef<HTMLInputElement>(null);

  const {isSubmitting} = useFormState(form);
  const field = useField<string>(form, name, {
    path,
    focus: () => ownRef.current?.focus(),
    validate,
  });

  const fieldError = field.error
    ? errorMessages?.[field.error] ?? defaultError
    : null;

  return (
    <S.Field className={className}>
      {label &&
        <S.Label htmlFor={id ?? autoId}>
          {label}
        </S.Label>}
      <S.TextInput
        {...otherProps}
        value={field.value}
        id={id ?? autoId}
        aria-describedby={!field.isValid ? `${autoId}-error` : undefined}
        aria-invalid={!field.isValid}
        readOnly={readOnly || isSubmitting}
        $invalid={!field.isValid}
        onChange={e => field.set(e.target.value)}
        ref={combineRefs(inputRef, ownRef)}
      />
      {fieldError &&
        <S.ErrorMessage id={`${autoId}-error`}>
          {fieldError}
        </S.ErrorMessage>}
    </S.Field>
  );
});
