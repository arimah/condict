import {Table, RowKey, Cell, CellKey, Layout, Selection} from '../value';

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

export const insertRow = <D>(
  table: Table<D>,
  location: InsertLocation
): Table<D> => Table.update(table, table => {
  const {selectionShape: sel, layout, rows} = table;

  const [originRow, offset] = getInsertIndex(
    location,
    sel.minRow,
    sel.maxRow,
    layout.rowCount
  );

  const currentFocus = Layout.getCellByKey(layout, sel.focus);

  // The process of inserting a new row is equivalent to inserting a new
  // column, in terms of expanding multi-row cells. See the comment in
  // `insertColumn` and, like, flip it 90 degrees.
  const newCells: CellKey[] = [];
  let nextFocus = sel.focus;
  for (let c = 0; c < layout.columnCount; ) {
    const layoutCell = Layout.getCellAt(layout, originRow, c);
    const protoCell = Table.getCell(table, layoutCell.key);

    const needsExtension = layoutCell.rowSpan > 1 && (
      location < 0
        // Trying to insert a row *before* - extend if the cell starts in
        // a row before originRow
        ? layoutCell.homeRow < originRow
        // Trying to insert a row *after* - extend if the cell *ends* in
        // a row after originRow
        : layoutCell.homeRow + layoutCell.rowSpan - 1 > originRow
    );
    if (needsExtension) {
      protoCell.rowSpan += 1;
      // Since we've extended this cell to cover the new row, we also know
      // it will cover every column in its columnSpan within that row.
      c += layoutCell.columnSpan;
    } else {
      const newCell = Cell.from(protoCell);
      newCells.push(newCell.key);
      table.cells.set(newCell.key, newCell);

      if (c === currentFocus.homeColumn) {
        // Focus moves to the corresponding column in the new row.
        nextFocus = newCell.key;
      }

      c++;
    }
  }

  rows.splice(originRow + offset, 0, {
    key: RowKey(),
    cells: newCells,
  });
  table.selection = Selection(nextFocus);
});

export const insertColumn = <D>(
  table: Table<D>,
  location: InsertLocation
): Table<D> => Table.update(table, table => {
  const {selectionShape: sel, layout, rows} = table;

  const [originColumn, offset] = getInsertIndex(
    location,
    sel.minColumn,
    sel.maxColumn,
    layout.columnCount
  );

  const currentFocus = Layout.getCellByKey(layout, sel.focus);

  // To insert a new column, we have to go through every *row* and see what
  // the originColumn contains. Given a table like this:
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
  let nextFocus = sel.focus;
  for (let r = 0; r < layout.rowCount; ) {
    const layoutCell = Layout.getCellAt(layout, r, originColumn);
    const protoCell = Table.getCell(table, layoutCell.key);

    const needsExtension = layoutCell.columnSpan > 1 && (
      location < 0
        // Trying to insert a column *before* - extend if the cell starts in
        // a column before originColumn
        ? layoutCell.homeColumn < originColumn
        // Trying to insert a column *after* - extend if the cell *ends* in
        // a column after originColumn
        : layoutCell.homeColumn + layoutCell.columnSpan - 1 > originColumn
    );
    if (needsExtension) {
      protoCell.columnSpan += 1;
      // Since we've extended this cell to cover the new column, we also know
      // it will cover every row in its rowSpan within that column.
      r += layoutCell.rowSpan;
    } else {
      const newCell = Cell.from(protoCell);
      const insertIndex = Table.findCellInsertIndex(table, r, originColumn + offset);
      rows[r].cells.splice(insertIndex, 0, newCell.key);
      table.cells.set(newCell.key, newCell);

      if (r === currentFocus.homeRow) {
        // Focus moves to the corresponding row in the new column.
        nextFocus = newCell.key;
      }

      r++;
    }
  }

  table.selection = Selection(nextFocus);
});
