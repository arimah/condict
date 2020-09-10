import {
  Table,
  RowKey,
  Cell,
  CellKey,
  Layout,
  Selection,
} from '../value';

const getOverlapSize = (
  selMin: number,
  selMax: number,
  cellPos: number,
  cellSpan: number
) => {
  const largestMin = Math.max(selMin, cellPos);
  const smallestMax = Math.min(selMax, cellPos + cellSpan - 1);
  return Math.max(0, smallestMax - largestMin + 1);
};

const getEmptyTable = <D>(prototype: Table<D>): Table<D> => {
  const cell: Cell = {
    key: CellKey(),
    rowSpan: 1,
    columnSpan: 1,
    header: false,
  };
  return Table.fromBase({
    defaultData: prototype.defaultData,
    isCellEmpty: prototype.isCellEmpty,
    cells: new Map([[cell.key, cell]]),
    cellData: new Map(),
    rows: [{
      key: RowKey(),
      cells: [cell.key],
    }],
    selection: Selection(cell.key),
  });
};

export const deleteSelectedRows = <D>(
  table: Table<D>
): Table<D> => {
  // If every row is selected, just return an empty table.
  if (
    table.selectionShape.minRow === 0 &&
    table.selectionShape.maxRow === table.layout.rowCount - 1
  ) {
    return getEmptyTable(table);
  }

  return Table.update(table, table => {
    const {selectionShape: sel, layout, rows} = table;

    // Deleting rows may seem easy at first glance, but cells that span multiple
    // rows can cause headaches. Consider this table:
    //
    //   +-------+-------+-------+
    //   |       |       |       |
    //   |       +-------+-------+
    //   |       |   B   |       |
    //   |   A   +-------+-------+
    //   |       |   C   |       |
    //   |       +-------+   D   |
    //   |       |       |       |
    //   +-------+-------+-------+
    //
    // Suppose we select cells B and C, then choose to delete those rows. A
    // and D overlap, but are not fully contained in, the rows to be deleted.
    //
    // For A, since it starts outside (i.e. above) the rows to be deleted, we
    // can get away with simply reducing its rowSpan by the amount of overlap
    // with the rows to be deleted. In this case it overlaps both rows, so we
    // subtract 2 from the rowSpan.
    //
    // Cell D is trickier. Since it starts *within* the rows to be deleted,
    // we can't just reduce the rowSpan. We also have to move it down to the
    // row immediately after the last row to be deleted.
    //
    // The result will be this table:
    //
    //   +-------+-------+-------+
    //   |       |       |       |
    //   |   A   +-------+-------+
    //   |       |       |   D   |
    //   +-------+-------+-------+

    const nextRow = sel.maxRow + 1;
    let nextRowNewCells = 0;
    for (let c = 0; c < layout.columnCount; c++) {
      for (let r = sel.minRow; r <= sel.maxRow; ) {
        const layoutCell = Layout.getCellAt(layout, r, c);

        if (layoutCell.homeColumn === c) {
          // First check: is this a multi-row cell that starts above selected
          // area?
          // Note: we don't have to test the rowSpan here. It could not possibly
          // be part of this row in the layout *and* start outside it without
          // having a rowSpan greater than 1.
          if (layoutCell.homeRow < sel.minRow) {
            const overlapSize = getOverlapSize(
              sel.minRow,
              sel.maxRow,
              layoutCell.homeRow,
              layoutCell.rowSpan
            );

            const cell = Table.getCell(table, layoutCell.key);
            cell.rowSpan -= overlapSize;
          } else if (layoutCell.homeRow === r) {
            // Second check: is it a multi-row cell that starts here but reaches
            // outside the selected area?
            if (layoutCell.homeRow + layoutCell.rowSpan > nextRow) {
              const overlapSize = getOverlapSize(
                sel.minRow,
                sel.maxRow,
                layoutCell.homeRow,
                layoutCell.rowSpan
              );

              const cell = Table.getCell(table, layoutCell.key);
              cell.rowSpan -= overlapSize;
              const insertIndex =
                Table.findCellInsertIndex(table, nextRow, c) +
                nextRowNewCells;
              rows[nextRow].cells.splice(insertIndex, 0, cell.key);
              nextRowNewCells++;
            } else {
              // The cell is fully contained within the selection. It will be
              // deleted.
              table.cells.delete(layoutCell.key);
              table.cellData.delete(layoutCell.key);
            }
          }
        }

        r += layoutCell.rowSpan;
      }
    }

    // The next selection will be a single cell in the same column as the current
    // focus. If we can select a cell in nextRow, we do so. Otherwise (i.e. when
    // the selection extends all the way to end of the table), we select the row
    // *above* the selection.
    const prevFocus = Layout.getCellByKey(layout, sel.focus);
    table.selection = Selection(
      Layout.getCellAt(
        layout,
        nextRow === layout.rowCount ? sel.minRow - 1 : nextRow,
        prevFocus.homeColumn
      ).key
    );
    rows.splice(sel.minRow, nextRow - sel.minRow);
    return;
  });
};

export const deleteSelectedColumns = <D>(
  table: Table<D>
): Table<D> => {
  // If every column is selected, just return an empty table.
  if (
    table.selectionShape.minColumn === 0 &&
    table.selectionShape.maxColumn === table.layout.columnCount - 1
  ) {
    return getEmptyTable(table);
  }

  return Table.update(table, table => {
    const {selectionShape: sel, layout, rows} = table;

    const nextColumn = sel.maxColumn + 1;
    for (let r = 0; r < layout.rowCount; r++) {
      let firstIndexToRemove: number | null = null;
      let removeCount = 0;

      for (let c = sel.minColumn; c <= sel.maxColumn; ) {
        const layoutCell = Layout.getCellAt(layout, r, c);

        if (layoutCell.homeRow !== r) {
          // The cell doesn't belong to this row; ignore it.
          c += layoutCell.columnSpan;
          continue;
        }

        if (
          // The cell starts *before* the selection, which means it spills over
          // into the selected columns.
          layoutCell.homeColumn < sel.minColumn ||
          // The cell ends *after* the selection, which means it spills *past*
          // the selected columns.
          layoutCell.homeColumn === c &&
          layoutCell.homeColumn + layoutCell.columnSpan > nextColumn
        ) {
          const overlapSize = getOverlapSize(
            sel.minColumn,
            sel.maxColumn,
            layoutCell.homeColumn,
            layoutCell.columnSpan
          );

          const cell = Table.getCell(table, layoutCell.key);
          cell.columnSpan -= overlapSize;

          c += overlapSize;
        } else {
          // The cell is fully contained within the selection. It will be
          // deleted.
          table.cells.delete(layoutCell.key);
          table.cellData.delete(layoutCell.key);
          if (firstIndexToRemove === null) {
            firstIndexToRemove = layoutCell.indexInRow;
          }
          removeCount++;

          c += layoutCell.columnSpan;
        }
      }

      if (firstIndexToRemove !== null) {
        rows[r].cells.splice(firstIndexToRemove, removeCount);
      }
    }

    // Focus moves to the same row in the next column, or the previous column
    // if there is no next column.
    const prevFocus = Layout.getCellByKey(layout, sel.focus);
    table.selection = Selection(
      Layout.getCellAt(
        layout,
        prevFocus.homeRow,
        nextColumn === layout.columnCount ? sel.minColumn - 1 : nextColumn
      ).key
    );
    return;
  });
};
