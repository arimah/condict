export default class Layout {
  constructor(rows) {
    Object.assign(this, buildLayout(rows));
  }

  cellFromPosition(row, col) {
    return this.grid[row * this.colCount + col];
  }

  cellFromKey(key) {
    return this.cellsByKey.get(key);
  }
}

const buildLayout = rows => {
  const colCounts = [];
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

  const grid = new Array(rowCount * colCount).fill(null);
  const cellsByKey = new Map();

  for (let r = 0; r < rowCount; r++) {
    const rowData = rows.get(r);

    let gridColumn = 0;
    for (let c = 0; c < rowData.cells.size; c++) {
      // Find the next free cell
      while (grid[r * colCount + gridColumn] !== null) {
        gridColumn++;
      }

      const cellData = rowData.cells.get(c);
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

const fillLayoutGrid = (grid, colCount, cell) => {
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
