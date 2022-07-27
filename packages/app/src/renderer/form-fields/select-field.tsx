import React, {ReactNode, Ref, ChangeEvent, useCallback, useRef} from 'react';

import {SelectProps, Button, useUniqueId, combineRefs} from '@condict/ui';

import {Validators, useNearestForm, useField} from '../form';

import * as S from './styles';

export type Props<T> = {
  name: string;
  path?: string;
  label?: ReactNode;
  mapValueToOption: (value: T) => string;
  mapOptionToValue: (option: string) => T;
  validate?: Validators<T>;
  defaultError?: ReactNode;
  errorMessages?: Record<string, ReactNode>;
  inputRef?: Ref<HTMLSelectElement>;
  createLabel?: ReactNode;
  onCreateNew?: () => void;
} & Omit<
  SelectProps,
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'form'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
>;

export type SelectFieldComponent = <T = any>(props: Props<T>) => JSX.Element;

// eslint-disable-next-line react/display-name
export const SelectField = React.memo((props: Props<any>): JSX.Element => {
  const {
    id,
    name,
    path,
    validate,
    mapValueToOption,
    mapOptionToValue,
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

  const field = useField<any>(form, name, {
    path,
    validate,
    focus: () => ownRef.current?.focus(),
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = mapOptionToValue(e.target.value);
    field.set(value);
  }, [mapOptionToValue]);

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
          value={mapValueToOption(field.value)}
          $invalid={!field.isValid}
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
