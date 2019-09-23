import {List} from 'immutable';

import genId from '@condict/gen-id';

import Value, {ValueData, RowType} from '../value';
import {Cell} from '../value/types';
import Layout from '../value/layout';
import Selection from '../value/selection';

import pathToCell from './path-to-cell';

export const enum InsertLocation {
  START = -2,
  BEFORE = -1,
  AFTER = 1,
  END = 2,
}

const getInsertIndex = (
  location: InsertLocation,
  selMin: number,
  selMax: number,
  tableSize: number
): [number, number] => {
  switch (location) {
    case InsertLocation.START:
      return [0, 0];
    case InsertLocation.BEFORE:
      return [selMin, 0];
    case InsertLocation.AFTER:
      return [selMax, 1];
    case InsertLocation.END:
      return [tableSize - 1, 1];
  }
};

export const insertRow = <V extends Value<any>>(
  value: V,
  location: InsertLocation
) => {
  const {selection, layout} = value;

  const [originRow, offset] = getInsertIndex(
    location,
    selection.minRow,
    selection.maxRow,
    layout.rowCount
  );

  // The process of inserting a new row is equivalent to inserting a new
  // column, in terms of expanding multi-row cells. See the comment in
  // `insertColumn` and, like, flip it 90 degrees.
  let newRows = value.rows;
  let newCells = List<Cell<ValueData<V>>>();
  for (let c = 0; c < layout.colCount; ) {
    const layoutCell = layout.cellFromPosition(originRow, c);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const protoCell = value.rows
      .get(layoutCell.row)!
      .cells
      .get(layoutCell.colIndex)!;

    const needsExtension = layoutCell.rowSpan > 1 && (
      location < 0
        // Trying to insert a row *before* - extend if the cell starts in
        // a row before originRow
        ? layoutCell.row < originRow
        // Trying to insert a row *after* - extend if the cell *ends* in
        // a row after originRow
        : layoutCell.row + layoutCell.rowSpan - 1 > originRow
    );
    if (needsExtension) {
      newRows = newRows.updateIn(
        pathToCell(layoutCell),
        (cell: Cell<ValueData<V>>) =>
          cell.set('rowSpan', cell.rowSpan + 1)
      );

      // Since we've extended this cell to cover the new row, we also know
      // it will cover every column in its columnSpan within that row.
      c += layoutCell.columnSpan;
    } else {
      const newCell = value.createCellFrom(protoCell);
      newCells = newCells.push(newCell);

      c++;
    }
  }
  newRows = newRows.insert(
    originRow + offset,
    RowType<ValueData<V>>({key: genId(), cells: newCells})
  );

  const newLayout = new Layout(newRows);
  // Focus moves to the corresponding column in the new row.
  const newSelection = new Selection(
    newLayout,
    newLayout.cellFromPosition(
      originRow + offset,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      layout.cellFromKey(selection.focusedCellKey)!.col
    ).key
  );
  return value.make(
    newRows,
    newLayout,
    newSelection
  );
};

export const insertColumn = <V extends Value<any>>(
  value: V,
  location: InsertLocation
) => {
  const {selection, layout} = value;

  const [originCol, offset] = getInsertIndex(
    location,
    selection.minCol,
    selection.maxCol,
    layout.colCount
  );

  let newRows = value.rows;
  // To insert a new column, we have to go through every *row* and see what
  // the originCol contains. Given a table like this:
  //
  //    +---------------+
  //    |       A       |
  //    +-------+-------+
  //    |   B   |   C   |
  //    +-------+-------+
  //
  // with cell C selected, if you try to insert a new column before, you'll
  // want cell A to expand to cover the new column. So you end up with this:
  //
  //    +-----------------------+
  //    |           A           |
  //    +-------+-------+-------+
  //    |   B   |  NEW  |   C   |
  //    +-------+-------+-------+
  //
  // But if you insert a new column before B or after C, A will not expand:
  //
  //    +-------+---------------+-------+
  //    |  NEW  |       A       |  NEW  |
  //    +-------+-------+-------+-------+
  //    |  NEW  |   B   |   C   |  NEW  |
  //    +-------+-------+-------+-------+
  for (let r = 0; r < layout.rowCount; ) {
    const layoutCell = layout.cellFromPosition(r, originCol);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const protoCell = value.rows
      .get(layoutCell.row)!
      .cells
      .get(layoutCell.colIndex)!;

    const needsExtension = layoutCell.columnSpan > 1 && (
      location < 0
        // Trying to insert a column *before* - extend if the cell starts in
        // a column before originCol
        ? layoutCell.col < originCol
        // Trying to insert a column *after* - extend if the cell *ends* in
        // a column after originCol
        : layoutCell.col + layoutCell.columnSpan - 1 > originCol
    );
    if (needsExtension) {
      newRows = newRows.updateIn(
        pathToCell(layoutCell),
        (cell: Cell<ValueData<V>>) =>
          cell.set('columnSpan', cell.columnSpan + 1)
      );

      // Since we've extended this cell to cover the new column, we also know
      // it will cover every row in its rowSpan within that column.
      r += layoutCell.rowSpan;
    } else {
      const newCell = value.createCellFrom(protoCell);
      const insertIndex = value.findCellInsertIndex(r, originCol + offset);
      newRows = newRows.updateIn(
        [r, 'cells'],
        (cells: List<Cell<ValueData<V>>>) =>
          cells.insert(insertIndex, newCell)
      );

      r++;
    }
  }

  const newLayout = new Layout(newRows);
  // Focus moves to the corresponding row in the new column.
  const newSelection = new Selection(
    newLayout,
    newLayout.cellFromPosition(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      layout.cellFromKey(selection.focusedCellKey)!.row,
      originCol + offset
    ).key
  );
  return value.make(
    newRows,
    newLayout,
    newSelection
  );
};
