import React, {ReactNode} from 'react';

import {TagInput, TagInputProps, useUniqueId} from '@condict/ui';

import {useNearestForm, useField, useFormState} from '../form';
import {useTagInputMessages} from '../hooks';

import * as S from './styles';

export type Props = {
  name: string;
  path?: string;
  label?: ReactNode;
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

// eslint-disable-next-line react/display-name
export const TagField = React.memo((props: Props): JSX.Element => {
  const {
    name,
    path,
    label,
    readOnly,
    errorMessage,
    ...otherProps
  } = props;

  const form = useNearestForm();

  const id = useUniqueId();

  const {isSubmitting} = useFormState(form);
  const field = useField<string[]>(form, name, {path});

  const messages = useTagInputMessages();

  return (
    <S.Field>
      {label &&
        <S.Label as='span' id={`${id}-label`}>
          {label}
        </S.Label>}
      <TagInput
        {...otherProps}
        tags={field.value}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        readOnly={readOnly || isSubmitting}
        messages={messages}
        onChange={field.set}
      />
      {errorMessage &&
        <S.ErrorMessage id={`${id}-error`}>
          {errorMessage}
        </S.ErrorMessage>}
    </S.Field>
  );
});
