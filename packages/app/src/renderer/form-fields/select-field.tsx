import React, {ReactNode, Ref, useCallback, useRef} from 'react';

import {SelectProps, Button, useUniqueId, combineRefs} from '@condict/ui';

import {Validators, useNearestForm, useField} from '../form';

import * as S from './styles';

export type Props<T> = {
  name: string;
  path?: string;
  label?: ReactNode;
  validate?: Validators<T>;
  defaultError?: ReactNode;
  errorMessages?: Record<string, ReactNode>;
  inputRef?: Ref<HTMLSelectElement>;
  createLabel?: ReactNode;
  onCreateNew?: () => void;
} & Omit<
  SelectProps<T>,
  | 'name'
  | 'value'
  | 'form'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'onChange'
  | 'ref'
>;

export type SelectFieldComponent = <T = any>(props: Props<T>) => JSX.Element;

// eslint-disable-next-line react/display-name
export const SelectField = React.memo(function<T>(
  props: Props<T>
): JSX.Element {
  const {
    id,
    name,
    path,
    validate,
    label,
    defaultError,
    errorMessages,
    inputRef,
    createLabel,
    onCreateNew,
    ...otherProps
  } = props;

  const form = useNearestForm();

  const autoId = useUniqueId();
  const ownRef = useRef<HTMLSelectElement>(null);

  const field = useField<T>(form, name, {
    path,
    validate,
    focus: () => ownRef.current?.focus(),
  });

  const handleChange = useCallback((value: T) => field.set(value), []);

  const fieldError = field.error
    ? errorMessages?.[field.error] ?? defaultError
    : null;

  return (
    <S.Field>
      {label &&
        <S.Label htmlFor={id ?? autoId}>
          {label}
        </S.Label>}
      <S.SelectWrapper>
        <S.Select
          {...otherProps}
          id={id ?? autoId}
          aria-describedby={!field.isValid ? `${autoId}-error` : undefined}
          aria-invalid={!field.isValid}
          $invalid={!field.isValid}
          value={field.value}
          onChange={handleChange}
          ref={combineRefs(inputRef, ownRef)}
        />
        {onCreateNew &&
          <Button slim onClick={onCreateNew}>
            {createLabel}
          </Button>}
      </S.SelectWrapper>
      {fieldError &&
        <S.ErrorMessage id={`${autoId}-error`}>
          {fieldError}
        </S.ErrorMessage>}
    </S.Field>
  );
}) as SelectFieldComponent;
