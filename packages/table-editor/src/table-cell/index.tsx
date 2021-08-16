import React, {Ref} from 'react';

import {useEditor} from '../context';
import {Table} from '../value';
import {CellWithData, CellEditFn, Messages} from '../types';

import * as S from './styles';

export type Props<D, M extends Messages> = {
  cell: CellWithData<D>;
  tableId: string;
  disabled: boolean;
  focused: boolean;
  selected: boolean;
  editing: CellWithData<D> | null;
  editingTable: Table<D> | null;
  editingTypedValue: string | null;
  messages: Messages & M;
  cellRef: Ref<HTMLElement>;
  onInput: CellEditFn<D>;
  onCommit: CellEditFn<D>;
};

export type TableCellComponent = <D, M extends Messages>(
  props: Props<D, M>
) => JSX.Element;

const TableCell = React.memo(
  <D, M extends Messages>(props: Props<D, M>) => {
    const {
      cell: item,
      tableId,
      disabled,
      focused,
      selected,
      editing,
      editingTable,
      editingTypedValue,
      messages,
      cellRef,
      onInput,
      onCommit,
    } = props;

    const effectiveItem = editing || item;
    const cellKey = item.cell.key;

    const {CellData, CellEditor, canEditCell} = useEditor<D, M>();

    // NB: Don't attempt to change the cell tag from th to td or vice versa
    // whilst editing the cell, as that will force the editor to be remounted
    // (i.e. closed).
    // Also, don't read layout stuff or the cell key from `editing`, as cell
    // editors aren't allowed to change those values and it can seriously mess
    // up the table.
    return (
      <S.Cell
        as={item.cell.header ? 'th' : 'td'}
        id={`${tableId}-${cellKey}`}
        header={effectiveItem.cell.header}
        selected={selected}
        disabled={disabled}
        colSpan={item.cell.columnSpan}
        rowSpan={item.cell.rowSpan}
        data-cell-key={cellKey}
        aria-selected={!disabled ? selected : undefined}
        aria-readonly={!canEditCell(item.cell, item.data)}
        aria-labelledby={`${cellKey}-content`}
        aria-describedby={`${tableId}-cellHint`}
        aria-owns={editing ? `${cellKey}-editor` : undefined}
        ref={cellRef as Ref<HTMLTableDataCellElement>}
      >
        <S.CellDataWrapper id={`${cellKey}-content`}>
          <CellData
            cell={effectiveItem.cell}
            data={effectiveItem.data}
            editing={!!editing}
            disabled={disabled}
            messages={messages}
          />
        </S.CellDataWrapper>
        <S.CellBorder
          disabled={disabled}
          selected={selected}
          focused={focused}
        />
        {editing &&
          <CellEditor
            id={`${cellKey}-editor`}
            initial={item}
            typedValue={editingTypedValue as string}
            table={editingTable as Table<D>}
            messages={messages}
            onInput={onInput}
            onCommit={onCommit}
          />}
      </S.Cell>
    );
  },
  (prevProps, nextProps) =>
    // Hand-rolled for more performance. React.memo is *generally* fast
    // enough, but tables can end up with a lot of cells that need a lot
    // of checking.
    // Also, some props are *assumed* never to change.
    prevProps.cell === nextProps.cell &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.focused === nextProps.focused &&
    prevProps.selected === nextProps.selected &&
    prevProps.messages === nextProps.messages &&
    prevProps.editing === nextProps.editing &&
    prevProps.editingTypedValue === nextProps.editingTypedValue
    // editingTable is only passed to the cell editor, and does not change
    // (the new value is committed when the editor is closed), so we don't
    // need to check that.
);

TableCell.displayName = 'TableCell';

export default TableCell as TableCellComponent;
