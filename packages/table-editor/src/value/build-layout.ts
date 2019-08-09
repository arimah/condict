import {List} from 'immutable';

import {Row, Cell, LayoutCell} from './types';

const fillLayoutGrid = (
  grid: LayoutCell[],
  colCount: number,
  cell: LayoutCell
) => {
  if (cell.rowSpan === 1 && cell.columnSpan === 1) {
    grid[cell.row * colCount + cell.col] = cell;
  } else {
    const {row, rowSpan, col, columnSpan} = cell;
    for (let r = 0; r < rowSpan; r++) {
      for (let c = 0; c < columnSpan; c++) {
        const index = (r + row) * colCount + c + col;
        grid[index] = cell;
      }
    }
  }
};

export default (rows: List<Row<unknown>>) => {
  const colCounts: number[] = [];
  rows.forEach((row, rowIndex) => {
    row.cells.forEach(cell => {
      const columnSpan = cell.columnSpan || 1;
      // This cell contributes columnSpan columns to every row it's in.
      for (let r = 0; r < cell.rowSpan; r++) {
        const index = rowIndex + r;
        colCounts[index] = (colCounts[index] || 0) + columnSpan;
      }
    });
  });

  const rowCount = colCounts.length;
  const colCount = colCounts.reduce((a, b) => Math.max(a, b), 0);

  const grid: LayoutCell[] = new Array(rowCount * colCount).fill(null);
  const cellsByKey: Map<string, LayoutCell> = new Map();

  for (let r = 0; r < rowCount; r++) {
    const rowData = rows.get(r) as Row<unknown>;

    let gridColumn = 0;
    for (let c = 0; c < rowData.cells.size; c++) {
      // Find the next free cell
      while (grid[r * colCount + gridColumn] !== null) {
        gridColumn++;
      }

      const cellData = rowData.cells.get(c) as Cell<unknown>;
      const gridCell = {
        row: r,
        col: gridColumn,
        colIndex: c,
        rowSpan: cellData.rowSpan,
        columnSpan: cellData.columnSpan,
        key: cellData.key,
      };
      fillLayoutGrid(grid, colCount, gridCell);
      cellsByKey.set(gridCell.key, gridCell);
    }
  }

  return {rowCount, colCount, grid, cellsByKey};
};
