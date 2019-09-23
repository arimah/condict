import React, {ComponentType} from 'react';
import {List} from 'immutable';

import makeTableCell, {Config} from './table-cell';
import {mapToArray} from './immutable-utils';
import Value, {ValueData} from './value';
import Selection from './value/selection';
import {Cell} from './value/types';
import {Messages} from './types';

export type Props<V extends Value<any>, M> = {
  cells: List<Cell<ValueData<V>>>;
  tableId: string;
  disabled: boolean;
  selection: Selection | null;
  editingCell: Cell<ValueData<V>> | null;
  editingTypedValue: string | null;
  editingTableValue: V | null;
  messages: Messages & M;
  onEditInput: (cell: Cell<ValueData<V>>) => void;
  onFinishEdit: (cell: Cell<ValueData<V>>) => void;
};

function makeTableRow<V extends Value<any>, M>(
  config: Config<V, M>
): ComponentType<Props<V, M>> {
  const TableCell = makeTableCell(config);

  const TableRow = React.memo(
    (props: Props<V, M>) => {
      const {
        cells,
        tableId,
        disabled,
        selection,
        editingCell,
        editingTypedValue,
        editingTableValue,
        messages,
        onEditInput,
        onFinishEdit,
      } = props;

      return (
        <tr>
          {mapToArray(cells, cell => {
            const focused = !!selection && selection.focusedCellKey === cell.key;
            const selected = !!selection && selection.isSelected(cell.key);

            return (
              <TableCell
                key={cell.key}
                cell={cell}
                tableId={tableId}
                disabled={disabled}
                focused={focused}
                selected={selected}
                editingCell={focused ? editingCell : null}
                editingTypedValue={
                  focused && editingCell
                    ? editingTypedValue
                    : null
                }
                editingTableValue={
                  focused && editingCell
                    ? editingTableValue
                    : null
                }
                messages={messages}
                onEditInput={onEditInput}
                onFinishEdit={onFinishEdit}
              />
            );
          })}
        </tr>
      );
    },
    (prevProps, nextProps) =>
      // Hand-rolled for more performance. React.memo is *generally* fast
      // enough, but tables can end up with a lot of rows that need a lot
      // of checking.
      // Also, some props are *assumed* never to change.
      prevProps.cells === nextProps.cells &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.selection === nextProps.selection &&
      prevProps.editingCell === nextProps.editingCell &&
      prevProps.editingTypedValue === nextProps.editingTypedValue
      // editingTableValue is only passed to the cell editor, and does not
      // change (the new value is committed when the editor is closed), so
      // we don't need to check that.
  );

  TableRow.displayName = 'TableRow';

  return TableRow;
}

export default makeTableRow;
