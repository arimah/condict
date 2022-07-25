import React, {ReactNode, KeyboardEvent, useCallback, useRef} from 'react';
import {FieldValues, FieldPath, useController} from 'react-hook-form';

import {CommandProvider, CommandGroup, useUniqueId} from '@condict/ui';
import {
  InflectionTable,
  InflectionTableEditorProps,
  useInflectionTableCommands,
} from '@condict/table-editor';

import {useTableEditorMessages} from '../../hooks';
import {LanguageId, PartOfSpeechId, InflectionTableId} from '../../graphql';

import {HistoryValue, useHistoryCommands} from '../history-value';
import * as S from '../styles';

import TableToolbar from './toolbar';
import {InflectionTableValue} from './types';

export type Props<D extends FieldValues> = {
  name: FieldPath<D>;
  label?: ReactNode;
  languageId: LanguageId;
  partOfSpeechId: PartOfSpeechId;
  inflectionTableId: InflectionTableId | null;
  errorMessage?: ReactNode;
} & Omit<
  InflectionTableEditorProps,
  | 'value'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'messages'
  | 'contextMenuExtra'
  | 'onChange'
  | 'onBlur'
  | 'onFocus'
>;

export type InflectionTableFieldComponent = {
  <D extends FieldValues>(props: Props<D>): JSX.Element;
  displayName: string;
};

export const InflectionTableField = React.memo((
  props: Props<FieldValues>
): JSX.Element => {
  const {
    name,
    label,
    languageId,
    partOfSpeechId,
    inflectionTableId,
    errorMessage,
    disabled,
    ...otherProps
  } = props;

  const id = useUniqueId();

  const {field, formState} = useController({name});
  const {onChange, onBlur} = field;
  const {isSubmitting} = formState;
  const value = field.value as InflectionTableValue;

  // The full inflection table value, with selection, layout and the rest.
  const historyRef = useRef<HistoryValue<InflectionTable> | null>(null);
  if (tableNeedsUpdate(historyRef.current, value)) {
    // Some part of the value has changed unexpectedly. We must update the table
    // to reflect the changes. Sadly that means resetting the selection, but we
    // *should* never end up in that situation in normal use anyway.
    historyRef.current = HistoryValue.createOrPush(
      InflectionTableValue.toTable(value),
      historyRef.current
    );
  }

  const version = useRef(0);
  const handleChange = useCallback((value: InflectionTable) => {
    // It should not be possible to get here without a valid history.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const history = historyRef.current!;
    let nextVersion: number;
    if (shouldReplaceHistory(history.current, value)) {
      HistoryValue.replace(history, value);
      nextVersion = version.current;
    } else {
      HistoryValue.push(history, value);
      nextVersion = ++version.current;
    }
    onChange(InflectionTableValue.fromTable(value, nextVersion));
  }, [onChange]);

  const handleImportLayout = useCallback((value: InflectionTableValue) => {
    // It should not be possible to get here without a valid history.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const history = historyRef.current!;
    HistoryValue.push(history, InflectionTableValue.toTable(value));
    onChange(value);
  }, [onChange]);

  // Logic above ensures historyRef.current is non-null.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const history = historyRef.current!;
  const table = history.current;

  const historyCommands = useHistoryCommands(history, onChange);

  const tableCommands = useInflectionTableCommands({
    value: table,
    disabled,
    onChange: handleChange,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!CommandGroup.handleKey(historyCommands, e)) {
      CommandGroup.handleKey(tableCommands, e);
    }
  }, [tableCommands]);

  const messages = useTableEditorMessages();

  return (
    <S.Field>
      {label &&
        <S.Label as='span' id={`${id}-label`}>
          {label}
        </S.Label>}
      <CommandProvider commands={historyCommands}>
        <CommandProvider commands={tableCommands}>
          <S.TableBorder onKeyDown={handleKeyDown}>
            <TableToolbar
              selection={table.selectionShape}
              canUndo={history.undo.length > 0}
              canRedo={history.redo.length > 0}
              valueRef={history}
              languageId={languageId}
              partOfSpeechId={partOfSpeechId}
              inflectionTableId={inflectionTableId}
              onImportLayout={handleImportLayout}
              onChange={handleChange}
            />
            <S.TableContainer>
              <S.InflectionTableEditor
                {...otherProps}
                value={table}
                aria-labelledby={label ? `${id}-label` : undefined}
                aria-describedby={errorMessage ? `${id}-error` : undefined}
                disabled={disabled}
                readOnly={isSubmitting}
                messages={messages}
                onChange={handleChange}
                onBlur={onBlur}
              />
            </S.TableContainer>
          </S.TableBorder>
        </CommandProvider>
      </CommandProvider>
      {errorMessage &&
        <S.ErrorMessage id={`${id}-error`}>
          {errorMessage}
        </S.ErrorMessage>}
    </S.Field>
  );
}) as InflectionTableFieldComponent;

InflectionTableField.displayName = 'InflectionTableField';

const tableNeedsUpdate = (
  history: HistoryValue<InflectionTable> | null,
  value: InflectionTableValue
): boolean => {
  if (!history) {
    return true;
  }
  const table = history.current;
  return (
    table === null ||
    table.rows !== value.rows ||
    table.cells !== value.cells ||
    table.cellData !== value.cellData
  );
};

const shouldReplaceHistory = (
  current: InflectionTable,
  next: InflectionTable
): boolean =>
  // If only the selection is different, we should replace the current history
  // state instead of pushing.
  // NB: `layout` and `selectionShape` are calculated; `isCellEmpty` and
  // `defaultData` are invariant.
  current.rows === next.rows &&
  current.cells === next.cells &&
  current.cellData === next.cellData;
