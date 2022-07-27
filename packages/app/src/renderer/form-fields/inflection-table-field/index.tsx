import React, {ReactNode, KeyboardEvent, useCallback, useRef} from 'react';

import {CommandProvider, CommandGroup, useUniqueId} from '@condict/ui';
import {
  InflectionTable,
  InflectionTableEditorProps,
  useInflectionTableCommands,
} from '@condict/table-editor';

import {useNearestForm, useField, useFormState} from '../../form';
import {useTableEditorMessages} from '../../hooks';
import {LanguageId, PartOfSpeechId, InflectionTableId} from '../../graphql';

import {HistoryValue, useHistoryCommands} from '../history-value';
import * as S from '../styles';

import TableToolbar from './toolbar';

export type Props = {
  name: string;
  path?: string;
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

export const InflectionTableField = React.memo((props: Props): JSX.Element => {
  const {
    name,
    path,
    label,
    languageId,
    partOfSpeechId,
    inflectionTableId,
    errorMessage,
    disabled,
    ...otherProps
  } = props;

  const form = useNearestForm();

  const id = useUniqueId();

  const field = useField<InflectionTable>(form, name, {path});
  const {isSubmitting} = useFormState(form);
  const value = field.value;

  // The full inflection table value, with selection, layout and the rest.
  const historyRef = useRef<HistoryValue<InflectionTable> | null>(null);
  if (tableNeedsUpdate(historyRef.current, value)) {
    // Some part of the value has changed unexpectedly. We must update the table
    // to reflect the changes.
    historyRef.current = HistoryValue.createOrPush(value, historyRef.current);
  }

  const handleChange = useCallback((value: InflectionTable) => {
    // It should not be possible to get here without a valid history.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const history = historyRef.current!;
    if (shouldReplaceHistory(history.current, value)) {
      HistoryValue.replace(history, value);
    } else {
      HistoryValue.push(history, value);
    }
    field.set(value);
  }, []);

  const handleImportLayout = useCallback((value: InflectionTable) => {
    // It should not be possible to get here without a valid history.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const history = historyRef.current!;
    HistoryValue.push(history, value);
    field.set(value);
  }, []);

  // Logic above ensures historyRef.current is non-null.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const history = historyRef.current!;
  const table = history.current;

  const historyCommands = useHistoryCommands(history, handleChange);

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
});

InflectionTableField.displayName = 'InflectionTableField';

const tableNeedsUpdate = (
  history: HistoryValue<InflectionTable> | null,
  value: InflectionTable
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
