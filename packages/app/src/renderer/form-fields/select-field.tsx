import React, {ReactNode, Ref, ChangeEvent, useCallback} from 'react';
import {
  FieldValues,
  FieldPath,
  FieldPathValue,
  useController,
} from 'react-hook-form';

import {SelectProps, Button, useUniqueId, combineRefs} from '@condict/ui';

import {Validators} from './types';
import * as S from './styles';
import getErrorMessage from './error-message';

export type Props<D extends FieldValues, P extends FieldPath<D>> = {
  name: P;
  label?: ReactNode;
  mapValueToOption: (value: FieldPathValue<D, P>) => string;
  mapOptionToValue: (option: string) => FieldPathValue<D, P>;
  validate?: Validators<FieldPathValue<D, P>>;
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

export type SelectFieldComponent = <D extends FieldValues, P extends FieldPath<D>>(
  props: Props<D, P>
) => JSX.Element;

// eslint-disable-next-line react/display-name
export const SelectField = React.memo((
  props: Props<FieldValues, FieldPath<FieldValues>>
): JSX.Element => {
  const {
    id,
    name,
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

  const autoId = useUniqueId();
  const {field, fieldState} = useController({
    name,
    rules: {
      required: otherProps.required,
      validate,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {value, onChange, ref: fieldRef, ...fieldProps} = field;

  const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = mapOptionToValue(e.target.value);
    onChange(value);
  }, [mapOptionToValue, onChange]);

  const {error: fieldError} = fieldState;
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
      <S.SelectWrapper>
        <S.Select
          {...otherProps}
          {...fieldProps}
          id={id ?? autoId}
          aria-describedby={fieldError ? `${autoId}-error` : undefined}
          value={mapValueToOption(value)}
          $invalid={Boolean(fieldError)}
          onChange={handleChange}
          ref={combineRefs(inputRef, fieldRef)}
        />
        {onCreateNew &&
          <Button slim onClick={onCreateNew}>
            {createLabel}
          </Button>}
      </S.SelectWrapper>
      {errorMessage &&
        <S.ErrorMessage id={`${autoId}-error`}>
          {errorMessage}
        </S.ErrorMessage>}
    </S.Field>
  );
}) as SelectFieldComponent;
