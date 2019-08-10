import React, {ComponentType} from 'react';

import Value from '../value';
import {Cell} from '../value/types';

import * as S from './styles';

export type Config<D, V extends Value<D>> = {
  CellData: ComponentType<CellDataProps<D>>;
  CellEditor: ComponentType<CellEditorProps<D, V>>;
  canEditCell: (cell: Cell<D>) => boolean;
};

export type CellDataProps<D> = {
  cell: Cell<D>;
  editing: boolean;
  disabled: boolean;
};

export type CellEditorProps<D, V extends Value<D>> = {
  id: string;
  initialCell: Cell<D>;
  typedValue: string | null;
  tableValue: V;
  onInput: (cell: Cell<D>) => void;
  onDone: (cell: Cell<D>) => void;
};

export type Props<D, V extends Value<D>> = {
  cell: Cell<D>;
  tableId: string;
  disabled: boolean;
  focused: boolean;
  selected: boolean;
  editingCell: Cell<D> | null;
  editingTypedValue: string | null;
  editingTableValue: V | null;
  onEditInput: (cell: Cell<D>) => void;
  onFinishEdit: (cell: Cell<D>) => void;
};

function makeTableCell<D, V extends Value<D>>(
  config: Config<D, V>
): ComponentType<Props<D, V>> {
  const {
    CellData,
    CellEditor,
    canEditCell,
  } = config;

  const TableCell = React.memo(
    (props: Props<D, V>) => {
      const {
        cell,
        tableId,
        disabled,
        focused,
        selected,
        editingCell,
        editingTypedValue,
        editingTableValue,
        onEditInput,
        onFinishEdit,
      } = props;

      const effectiveCell = editingCell || cell;

      // NB: Don't attempt to change the cell tag from th to td or vice versa
      // whilst editing the cell, as that will force the editor to be remounted
      // (i.e. closed).
      // Also, don't read layout stuff or the cell key from editingCell, as cell
      // editors aren't allowed to change those values and it can seriously mess
      // up the table.
      return (
        <S.Cell
          as={cell.header ? 'th' : 'td'}
          id={`${tableId}-${cell.key}`}
          header={effectiveCell.header}
          selected={selected}
          disabled={disabled}
          colSpan={cell.columnSpan}
          rowSpan={cell.rowSpan}
          data-cell-key={cell.key}
          aria-selected={!disabled ? String(selected) as 'true' | 'false' : undefined}
          aria-readonly={!canEditCell(cell) ? 'true' : 'false'}
          aria-labelledby={`${cell.key}-content`}
          aria-describedby={`${tableId}-cellHint`}
          aria-owns={editingCell ? `${cell.key}-editor` : undefined}
        >
          <S.CellDataWrapper id={`${cell.key}-content`}>
            <CellData
              cell={effectiveCell}
              editing={!!editingCell}
              disabled={disabled}
            />
          </S.CellDataWrapper>
          <S.CellBorder
            disabled={disabled}
            selected={selected}
            focused={focused}
          />
          {editingCell &&
            <CellEditor
              id={`${cell.key}-editor`}
              initialCell={editingCell}
              typedValue={editingTypedValue as string}
              tableValue={editingTableValue as V}
              onInput={onEditInput}
              onDone={onFinishEdit}
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
      prevProps.editingCell === nextProps.editingCell &&
      prevProps.editingTypedValue === nextProps.editingTypedValue
      // editingTableValue is only passed to the cell editor, and does not
      // change (the new value is committed when the editor is closed), so
      // we don't need to check that.
  );

  TableCell.displayName = 'TableCell';

  return TableCell;
}

export default makeTableCell;
