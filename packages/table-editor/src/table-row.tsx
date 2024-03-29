import React, {Ref} from 'react';

import {Table, SelectionShape} from './value';
import TableCell from './table-cell';
import {CellWithData, CellEditFn, Messages} from './types';

export type Props<D, M extends Messages> = {
  cells: readonly CellWithData<D>[];
  tableId: string;
  disabled: boolean;
  selection: SelectionShape | null;
  editing: CellWithData<D> | null;
  editingTable: Table<D> | null;
  editingTypedValue: string | null;
  messages: Messages & M;
  focusedCellRef: Ref<HTMLElement>;
  onInput: CellEditFn<D>;
  onCommit: CellEditFn<D>;
};

export type TableRowComponent = <D, M extends Messages>(
  props: Props<D, M>
) => JSX.Element;

function areCellsSame(
  prev: readonly CellWithData<unknown>[],
  next: readonly CellWithData<unknown>[]
): boolean {
  if (prev.length !== next.length) {
    return false;
  }
  const len = prev.length;
  for (let i = 0; i < len; i++) {
    const p = prev[i];
    const n = next[i];
    if (p.cell !== n.cell || p.data !== n.data) {
      return false;
    }
  }
  return true;
}

const TableRow = React.memo(
  <D, M extends Messages>(props: Props<D, M>) => {
    const {
      cells,
      tableId,
      disabled,
      selection,
      editing,
      editingTable,
      editingTypedValue,
      messages,
      focusedCellRef,
      onInput,
      onCommit,
    } = props;

    return (
      <tr>
        {cells.map(item => {
          const focused = selection?.focus === item.cell.key;
          const selected = selection?.cells.has(item.cell.key) ?? false;

          return (
            <TableCell
              key={item.cell.key}
              cell={item}
              tableId={tableId}
              disabled={disabled}
              focused={focused}
              selected={selected}
              editing={focused ? editing : null}
              editingTable={
                focused && editing
                  ? editingTable
                  : null
              }
              editingTypedValue={
                focused && editing
                  ? editingTypedValue
                  : null
              }
              messages={messages}
              cellRef={focused ? focusedCellRef : null}
              onInput={onInput}
              onCommit={onCommit}
            />
          );
        })}
      </tr>
    );
  },
  (prevProps, nextProps) =>
    // Hand-rolled for more performance. React.memo is *generally* fast enough,
    // but tables can end up with a lot of rows that need a lot of checking.
    // Also, some props are *assumed* never to change.
    areCellsSame(prevProps.cells, nextProps.cells) &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.selection === nextProps.selection &&
    prevProps.messages === nextProps.messages &&
    prevProps.editing === nextProps.editing &&
    prevProps.editingTypedValue === nextProps.editingTypedValue &&
    prevProps.focusedCellRef === nextProps.focusedCellRef
    // editingTable is only passed to the cell editor, and does not change
    // (the new value is committed when the editor is closed), so we don't
    // need to check that.
);

TableRow.displayName = 'TableRow';

export default TableRow as TableRowComponent;
