import {TableBase, CellKey, Layout, LayoutCell, SelectionShape} from './types';

const findSelectionBounds = (
  layout: Layout,
  cellA: LayoutCell,
  cellB: LayoutCell
) => {
  // Consider the following table:
  //
  //   +-------+-------+
  //   |       |   B   |
  //   |   A   +-------+
  //   |       |       |
  //   +-------+   C   |
  //   |   D   |       |
  //   +-------+-------+
  //
  // Suppose the focus is placed in cell B. The user then attempts to extend
  // the selection to include cell A. Because cell A spans two rows, we must
  // include the second row in the selection as well, which means cell C is
  // now selected. But cell C also spans two rows, so we need to extend the
  // selection even further, to include cell D.
  //
  // When we encounter a cell that spans multiple rows or columns, we expand
  // the row and column range (as specified by minRow, maxRow, minCol, maxCol)
  // and run through the table again.
  //
  // Cells with large spans are rare, and in most cases the loop won't have
  // to run more than once or twice.
  const {columnCount, grid, cells} = layout;

  // All values are inclusive
  let minRow = Math.min(cellA.homeRow, cellB.homeRow);
  let maxRow = Math.max(cellA.homeRow, cellB.homeRow);
  let minColumn = Math.min(cellA.homeColumn, cellB.homeColumn);
  let maxColumn = Math.max(cellA.homeColumn, cellB.homeColumn);

  let retry = true;
  const tryExpandSelection = (cell: LayoutCell) => {
    if (cell.homeColumn < minColumn) {
      minColumn = cell.homeColumn;
      retry = true;
    }
    if (cell.homeColumn + cell.columnSpan - 1 > maxColumn) {
      maxColumn = cell.homeColumn + cell.columnSpan - 1;
      retry = true;
    }
    if (cell.homeRow < minRow) {
      minRow = cell.homeRow;
      retry = true;
    }
    if (cell.homeRow + cell.rowSpan - 1 > maxRow) {
      maxRow = cell.homeRow + cell.rowSpan - 1;
      retry = true;
    }
  };

  const getCell = (row: number, column: number): LayoutCell => {
    const key = grid[row * columnCount + column];
    return cells.get(key) as LayoutCell;
  };

  while (retry) {
    retry = false;
    // The only cells that can expand the selection are the ones intersecting
    // the edges of the selection, so we needn't loop through *every* cell in
    // the current selection bounds.
    for (let c = minColumn; c <= maxColumn; c++) {
      // First row
      tryExpandSelection(getCell(minRow, c));
      // Last row
      tryExpandSelection(getCell(maxRow, c));
    }
    for (let r = minRow + 1; r <= maxRow - 1; r++) {
      // First column
      tryExpandSelection(getCell(r, minColumn));
      // Last column
      tryExpandSelection(getCell(r, maxColumn));
    }
  }

  return {minRow, maxRow, minColumn, maxColumn};
};

const buildSelectionShape = (
  table: TableBase<unknown>,
  layout: Layout
): SelectionShape => {
  const {anchor, focus} = table.selection;
  const {columnCount, grid, cells} = layout;

  const selectedCells = new Set<CellKey>();
  if (focus === anchor) {
    selectedCells.add(focus);

    const cell = cells.get(focus) as LayoutCell;
    return {
      anchor,
      focus,
      cells: selectedCells,
      minRow: cell.homeRow,
      maxRow: cell.homeRow + cell.rowSpan - 1,
      minColumn: cell.homeColumn,
      maxColumn: cell.homeColumn + cell.columnSpan - 1,
    };
  } else {
    const bounds = findSelectionBounds(
      layout,
      cells.get(focus) as LayoutCell,
      cells.get(anchor) as LayoutCell
    );

    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      for (let c = bounds.minColumn; c <= bounds.maxColumn; c++) {
        selectedCells.add(grid[r * columnCount + c]);
      }
    }

    return {anchor, focus, cells: selectedCells, ...bounds};
  }
};

export default buildSelectionShape;
