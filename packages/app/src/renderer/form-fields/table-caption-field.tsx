import React, {ReactNode} from 'react';
import {FieldValues, FieldPath, useController} from 'react-hook-form';

import {useUniqueId} from '@condict/ui';
import {TableCaptionEditorProps, BlockElement} from '@condict/rich-text-editor';

import {useRichTextEditorMessages} from '../hooks';

import * as S from './styles';

export type Props<D extends FieldValues> = {
  name: FieldPath<D>;
  label?: ReactNode;
  defaultValue?: BlockElement[];
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

export type TableCaptionFieldComponent = <D extends FieldValues>(
  props: Props<D>
) => JSX.Element;

// eslint-disable-next-line react/display-name
export const TableCaptionField = React.memo((
  props: Props<FieldValues>
): JSX.Element => {
  const {name, label, defaultValue, errorMessage, ...otherProps} = props;

  const id = useUniqueId();

  const {field, formState} = useController({name, defaultValue});
  const {onChange, onBlur} = field;
  const {isSubmitting} = formState;
  const value = field.value as BlockElement[];

  const messages = useRichTextEditorMessages();

  return (
    <S.Field>
      {label &&
        <S.Label as='span' id={`${id}-label`}>
          {label}
        </S.Label>}
      <S.TableCaptionEditor
        {...otherProps}
        value={value}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        readOnly={isSubmitting}
        toolbarAlwaysVisible={false}
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
}) as TableCaptionFieldComponent;
