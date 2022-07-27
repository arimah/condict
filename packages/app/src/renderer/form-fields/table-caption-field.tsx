import React, {ReactNode} from 'react';

import {useUniqueId} from '@condict/ui';
import {TableCaptionEditorProps, BlockElement} from '@condict/rich-text-editor';

import {useNearestForm, useField, useFormState} from '../form';
import {useRichTextEditorMessages} from '../hooks';

import * as S from './styles';

export type Props = {
  name: string;
  path?: string;
  label?: ReactNode;
  errorMessage?: ReactNode;
} & Omit<
  TableCaptionEditorProps,
  | 'value'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'messages'
  | 'onChange'
  | 'onFindLinkTarget'
  | 'onFocus'
  | 'onBlur'
>;

// eslint-disable-next-line react/display-name
export const TableCaptionField = React.memo((props: Props): JSX.Element => {
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
  const field = useField<BlockElement[]>(form, name, {path});

  const messages = useRichTextEditorMessages();

  return (
    <S.Field>
      {label &&
        <S.Label as='span' id={`${id}-label`}>
          {label}
        </S.Label>}
      <S.TableCaptionEditor
        {...otherProps}
        value={field.value}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={!field.isValid ? `${id}-error` : undefined}
        readOnly={readOnly || isSubmitting}
        toolbarAlwaysVisible={false}
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
