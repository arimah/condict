import {List} from 'immutable';

import Value from '../value';
import Layout from '../value/layout';
import Selection from '../value/selection';
import {Cell} from '../value/types';

import pathToCell from './path-to-cell';

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

export const deleteSelectedRows = <D, V extends Value<D>>(value: V) => {
  const {selection, layout} = value;

  // If every row is selected, just return an empty table.
  if (selection.minRow === 0 && selection.maxRow === layout.rowCount - 1) {
    return value.make();
  }

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

  const nextRow = selection.maxRow + 1;
  let newRows = value.rows;
  let nextRowNewCells = 0;
  for (let c = 0; c < layout.colCount; c++) {
    // First pass: find multi-row cells that start above the rows to be deleted.
    {
      const layoutCell = layout.cellFromPosition(selection.minRow, c);
      // Note: we don't have to test the rowSpan here. It could not possibly be
      // part of this row in the layout *and* start outside it without having a
      // rowSpan greater than 1.
      if (layoutCell.col === c && layoutCell.row < selection.minRow) {
        const overlapSize = getOverlapSize(
          selection.minRow,
          selection.maxRow,
          layoutCell.row,
          layoutCell.rowSpan
        );
        newRows = newRows.updateIn(pathToCell(layoutCell), (cell: Cell<D>) =>
          cell.set('rowSpan', cell.rowSpan - overlapSize)
        );
      }
    }

    // Second pass: find multi-row cells that start *inside* the rows.
    {
      const layoutCell = layout.cellFromPosition(selection.maxRow, c);
      if (
        layoutCell.col === c &&
        layoutCell.row >= selection.minRow &&
        layoutCell.row + layoutCell.rowSpan > nextRow
      ) {
        const overlapSize = getOverlapSize(
          selection.minRow,
          selection.maxRow,
          layoutCell.row,
          layoutCell.rowSpan
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const newCell = value.rows
          .get(layoutCell.row)!
          .cells
          .get(layoutCell.colIndex)!
          .update('rowSpan', rowSpan => rowSpan - overlapSize);
        const insertIndex =
          value.findCellInsertIndex(nextRow, c) +
          nextRowNewCells;
        newRows = newRows.updateIn([nextRow, 'cells'], (cells: List<Cell<D>>) =>
          cells.insert(insertIndex, newCell)
        );
        nextRowNewCells++;
      }
    }
  }

  newRows = newRows.splice(selection.minRow, nextRow - selection.minRow);
  const newLayout = new Layout(newRows);
  // Focus moves to the same column in the next row, or the previous row
  // if there is no next row.
  const newSelection = new Selection(
    newLayout,
    newLayout.cellFromPosition(
      Math.min(selection.minRow, newLayout.rowCount - 1),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      layout.cellFromKey(selection.focusedCellKey)!.col
    ).key
  );
  return value.make(newRows, newLayout, newSelection);
};

export const deleteSelectedColumns = <D, V extends Value<D>>(value: V) => {
  const {selection, layout} = value;

  // If every column is selected, just return an empty table.
  if (selection.minCol === 0 && selection.maxCol === layout.colCount - 1) {
    return value.make();
  }

  const nextCol = selection.maxCol + 1;
  let newRows = value.rows;
  for (let r = 0; r < layout.rowCount; r++) {
    let firstIndexToRemove: number | null = null;
    let removeCount = 0;

    for (let c = selection.minCol; c <= selection.maxCol; ) {
      const layoutCell = layout.cellFromPosition(r, c);

      if (layoutCell.row !== r) {
        // The cell doesn't belong to this row; ignore it.
        c += layoutCell.columnSpan;
        continue;
      }

      if (
        // The cell starts *before* the selection, which means it spills over
        // into the selected columns.
        layoutCell.col < selection.minCol ||
        // The cell ends *after* the selection, which means it spills *past*
        // the selected columns.
        layoutCell.col === c &&
        layoutCell.col + layoutCell.columnSpan > nextCol
      ) {
        const overlapSize = getOverlapSize(
          selection.minCol,
          selection.maxCol,
          layoutCell.col,
          layoutCell.columnSpan
        );

        newRows = newRows.updateIn(pathToCell(layoutCell), (cell: Cell<D>) =>
          cell.set('columnSpan', cell.columnSpan - overlapSize)
        );

        c += overlapSize;
      } else {
        // The cell is fully contained within the selection. It will be
        // deleted.
        if (firstIndexToRemove === null) {
          firstIndexToRemove = layoutCell.colIndex;
        }
        removeCount++;

        c += layoutCell.columnSpan;
      }
    }

    if (firstIndexToRemove !== null) {
      newRows = newRows.updateIn([r, 'cells'], (cells: List<Cell<D>>) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cells.splice(firstIndexToRemove!, removeCount)
      );
    }
  }

  const newLayout = new Layout(newRows);
  // Focus moves to the same row in the next column, or the previous column
  // if there is no next column.
  const newSelection = new Selection(
    newLayout,
    newLayout.cellFromPosition(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      layout.cellFromKey(selection.focusedCellKey)!.row,
      Math.min(selection.minCol, newLayout.colCount - 1)
    ).key
  );
  return value.make(newRows, newLayout, newSelection);
};
