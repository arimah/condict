import React, {ReactNode} from 'react';
import {FieldValues, FieldPath, useController} from 'react-hook-form';

import {TagInput, TagInputProps, useUniqueId} from '@condict/ui';

import {useTagInputMessages} from '../hooks';

import * as S from './styles';

export type Props<D extends FieldValues> = {
  name: FieldPath<D>;
  label?: ReactNode;
  defaultValue?: readonly string[];
  errorMessage?: ReactNode;
} & Omit<
  TagInputProps,
  | 'tags'
  | 'aria-label'
  | 'aria-labelledby'
  | 'messages'
  | 'onChange'
  | 'onFocus'
  | 'onBlur'
>;

export type TagFieldComponent = <D extends FieldValues>(
  props: Props<D>
) => JSX.Element;

// eslint-disable-next-line react/display-name
export const TagField = React.memo((props: Props<FieldValues>): JSX.Element => {
  const {
    name,
    label,
    defaultValue,
    readOnly,
    errorMessage,
    ...otherProps
  } = props;

  const id = useUniqueId();

  const {field, formState} = useController({name, defaultValue});
  const {onChange, onBlur} = field;
  const {isSubmitting} = formState;
  const value = field.value as string[];

  const messages = useTagInputMessages();

  return (
    <S.Field>
      {label &&
        <S.Label as='span' id={`${id}-label`}>
          {label}
        </S.Label>}
      <TagInput
        {...otherProps}
        tags={value}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        readOnly={readOnly || isSubmitting}
        messages={messages}
        onChange={onChange}
        onBlur={onBlur}
      />
      {errorMessage &&
        <S.ErrorMessage id={`${id}-error`}>
          {errorMessage}
        </S.ErrorMessage>}
    </S.Field>
  );
}) as TagFieldComponent;
