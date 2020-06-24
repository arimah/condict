import {
  Table,
  Row,
  RowKey,
  Cell,
  CellKey,
  Selection,
  IsCellEmptyFn,
  StandardRow,
} from './types';

export const convertStandardTable = <C, D>(
  inputRows: readonly StandardRow<C>[],
  defaultData: D,
  isCellEmpty: IsCellEmptyFn<D>,
  convertCell: (cell: C) => [Cell, D]
): Table<D> => {
  const cells = new Map<CellKey, Cell>();
  const cellData = new Map<CellKey, D>();
  const rows: Row[] = inputRows.map(inputRow => ({
    key: RowKey(),
    cells: inputRow.cells.map(inputCell => {
      const [cell, data] = convertCell(inputCell);
      cells.set(cell.key, cell);
      cellData.set(cell.key, data);
      return cell.key;
    }),
  }));

  const selection = Selection(rows[0].cells[0]);
  return Table.fromBase({
    cells,
    cellData,
    rows,
    selection,
    defaultData,
    isCellEmpty,
  });
};
