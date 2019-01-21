export default class Selection {
  constructor(
    layout,
    focusedCellKey,
    selectionStart = null
  ) {
    this.layout = layout;
    this.focusedCellKey = focusedCellKey || layout.grid[0].key;
    this.selectionStart = selectionStart || this.focusedCellKey;

    Object.assign(this, findSelection(
      this.layout,
      this.focusedCellKey,
      this.selectionStart
    ));
  }

  get size() {
    return this.selectedCells.size;
  }

  isSelected(cellKey) {
    return this.selectedCells.has(cellKey);
  }
}


const findSelection = (layout, focusedCellKey, selectionStart) => {
  const {colCount, grid, cellsByKey} = layout;

  const selectedCells = new Set();
  if (focusedCellKey === selectionStart) {
    selectedCells.add(focusedCellKey);

    const cell = cellsByKey.get(focusedCellKey);
    return {
      selectedCells,
      minRow: cell.row,
      maxRow: cell.row + cell.rowSpan - 1,
      minCol: cell.col,
      maxCol: cell.col + cell.columnSpan - 1,
    };
  } else {

    const {minRow, maxRow, minCol, maxCol} = findSelectionBounds(
      layout,
      cellsByKey.get(focusedCellKey),
      cellsByKey.get(selectionStart)
    );

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        selectedCells.add(grid[r * colCount + c].key);
      }
    }

    return {selectedCells, minRow, maxRow, minCol, maxCol};
  }
};

const findSelectionBounds = (layout, cellA, cellB) => {
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
  const {colCount, grid} = layout;

  // All values are inclusive
  let minRow = Math.min(cellA.row, cellB.row);
  let maxRow = Math.max(cellA.row, cellB.row);
  let minCol = Math.min(cellA.col, cellB.col);
  let maxCol = Math.max(cellA.col, cellB.col);

  let retry = true;
  const tryExpandSelection = cell => {
    if (cell.col < minCol) {
      minCol = cell.col;
      retry = true;
    }
    if (cell.col + cell.columnSpan - 1 > maxCol) {
      maxCol = cell.col + cell.columnSpan - 1;
      retry = true;
    }
    if (cell.row < minRow) {
      minRow = cell.row;
      retry = true;
    }
    if (cell.row + cell.rowSpan - 1 > maxRow) {
      maxRow = cell.row + cell.rowSpan - 1;
      retry = true;
    }
  };

  while (retry) {
    retry = false;
    // The only cells that can expand the selection are the ones intersecting
    // the edges of the selection, so we needn't loop through *every* cell in
    // the current selection bounds.
    for (let c = minCol; c <= maxCol; c++) {
      // First row
      tryExpandSelection(grid[minRow * colCount + c]);
      // Last row
      tryExpandSelection(grid[maxRow * colCount + c]);
    }
    for (let r = minRow + 1; r <= maxRow - 1; r++) {
      // First column
      tryExpandSelection(grid[r * colCount + minCol]);
      // Last column
      tryExpandSelection(grid[r * colCount + maxCol]);
    }
  }

  return {minRow, maxRow, minCol, maxCol};
};
