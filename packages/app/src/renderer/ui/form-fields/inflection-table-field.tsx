import React, {
  ReactNode,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useRef,
} from 'react';
import {FieldValues, FieldPath, useController} from 'react-hook-form';
import {useLocalization} from '@fluent/react';
import UndoIcon from 'mdi-react/UndoIcon';
import RedoIcon from 'mdi-react/RedoIcon';
import InsertRowAboveIcon from 'mdi-react/TableRowPlusBeforeIcon';
import InsertRowBelowIcon from 'mdi-react/TableRowPlusAfterIcon';
import DeleteRowIcon from 'mdi-react/TableRowRemoveIcon';
import InsertColumnBeforeIcon from 'mdi-react/TableColumnPlusBeforeIcon';
import InsertColumnAfterIcon from 'mdi-react/TableColumnPlusAfterIcon';
import DeleteColumnIcon from 'mdi-react/TableColumnRemoveIcon';
import MergeIcon from 'mdi-react/TableMergeCellsIcon';
import SeparateIcon from 'mdi-react/TableSplitCellIcon';

import {Toolbar, CommandProvider, CommandGroup, useUniqueId} from '@condict/ui';
import {
  InflectionTable,
  InflectionTableEditorProps,
  InflectionTableJson,
  Table,
  Selection,
  SelectionShape,
  useInflectionTableCommands,
} from '@condict/table-editor';

import {InflectionTableRowInput} from '../../graphql';
import {useTableEditorMessages} from '../../hooks';

import {HistoryValue, useHistoryCommands} from './history-value';
import * as S from './styles';

export type Props<D extends FieldValues> = {
  name: FieldPath<D>;
  label?: ReactNode;
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

/*
 * The base InflectionTable contains three extra properties – `selection`,
 * `layout` and `selectionShape` – that control selection and traversal in the
 * table. Unfortunately, there is no way to tell react-hook-form that these
 * properties are irrelevant for calculating the dirtiness of the field, so the
 * tab will appear dirty if you so much as move the selection around inside the
 * table.
 *
 * Hence, the form value contains everything except those two properties, which
 * we fill as necessary. This does lead to a bit of extra work as we destroy and
 * recreate those things.
 */

export type InflectionTableValue = Omit<
  InflectionTable,
  'selection' | 'layout' | 'selectionShape'
>;

export const InflectionTableValue = {
  fromTable(table: InflectionTable): InflectionTableValue {
    const {
      selection: _s,
      layout: _l,
      selectionShape: _sh,
      ...value
    } = table;
    return value;
  },

  toTable(value: InflectionTableValue): InflectionTable {
    return Table.fromBase({
      ...value,
      selection: Selection(value.rows[0].cells[0]),
    });
  },

  fromGraphQLResponse(rows: InflectionTableJson): InflectionTableValue {
    return InflectionTableValue.fromTable(InflectionTable.fromJson(rows));
  },

  toGraphQLInput(value: InflectionTableValue): InflectionTableRowInput[] {
    const table = InflectionTableValue.toTable(value);
    return InflectionTable.export(table) as InflectionTableRowInput[];
  },
} as const;

export type InflectionTableEditorComponent = <D extends FieldValues>(
  props: Props<D>
) => JSX.Element;

export const InflectionTableField = React.memo((
  props: Props<FieldValues>
): JSX.Element => {
  const {name, label, errorMessage, disabled, ...otherProps} = props;

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

  const handleChange = useCallback((value: InflectionTable) => {
    // It should not be possible to get here without a valid history.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const history = historyRef.current!;
    if (shouldReplaceHistory(history.current, value)) {
      HistoryValue.replace(history, value);
    } else {
      HistoryValue.push(history, value);
    }
    onChange(InflectionTableValue.fromTable(value));
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
            />
            <S.TableContainer>
              <S.InflectionTableEditor
                {...otherProps}
                // Logic above ensures table.current is non-null.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        </S.ErrorMessage>}
    </S.Field>
  );
}) as InflectionTableEditorComponent;

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

type TableToolbarProps = {
  selection: SelectionShape;
  canUndo: boolean;
  canRedo: boolean;
};

const preventDefault = (e: MouseEvent) => {
  e.preventDefault();
};

const TableToolbar = (props: TableToolbarProps): JSX.Element => {
  const {selection, canUndo, canRedo} = props;
  const {l10n} = useLocalization();
  const colCount = selection.maxColumn - selection.minColumn + 1;
  const rowCount = selection.maxRow - selection.minRow + 1;
  return (
    <S.TableToolbar onMouseDown={preventDefault}>
      <Toolbar.Group>
        <Toolbar.Button
          command='undo'
          disabled={!canUndo}
          label={l10n.getString('generic-undo-button')}
        >
          <UndoIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='redo'
          disabled={!canRedo}
          label={l10n.getString('generic-redo-button')}
        >
          <RedoIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='insertRowAbove'
          label={l10n.getString('table-editor-insert-row-above-button')}
        >
          <InsertRowAboveIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='insertRowBelow'
          label={l10n.getString('table-editor-insert-row-below-button')}
        >
          <InsertRowBelowIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='deleteSelectedRows'
          label={l10n.getString('table-editor-delete-rows', {
            count: rowCount,
          })}
        >
          <DeleteRowIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='insertColumnBefore'
          label={l10n.getString('table-editor-insert-column-before-button')}
        >
          <InsertColumnBeforeIcon className='rtl-mirror'/>
        </Toolbar.Button>
        <Toolbar.Button
          command='insertColumnAfter'
          label={l10n.getString('table-editor-insert-column-after-button')}
        >
          <InsertColumnAfterIcon className='rtl-mirror'/>
        </Toolbar.Button>
        <Toolbar.Button
          command='deleteSelectedColumns'
          label={l10n.getString('table-editor-delete-columns', {
            count: colCount,
          })}
        >
          <DeleteColumnIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='mergeSelection'
          label={l10n.getString('table-editor-merge-cells')}
        >
          <MergeIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='separateSelection'
          label={l10n.getString('table-editor-separate-cells')}
        >
          <SeparateIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
    </S.TableToolbar>
  );
};
