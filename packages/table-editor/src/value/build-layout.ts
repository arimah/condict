import {TableBase, Table, CellKey, Layout, LayoutCell} from './types';

const fillLayoutGrid = (
  grid: CellKey[],
  columnCount: number,
  cell: LayoutCell
) => {
  const {key, rowSpan, columnSpan, homeRow: row, homeColumn: column} = cell;

  if (rowSpan === 1 && columnSpan === 1) {
    grid[row * columnCount + column] = key;
  } else {
    for (let r = 0; r < rowSpan; r++) {
      for (let c = 0; c < columnSpan; c++) {
        const index = (r + row) * columnCount + c + column;
        grid[index] = key;
      }
    }
  }
};

const buildLayout = (table: TableBase<unknown>): Layout => {
  // First we need to calculate the total size of the table.
  const columnCounts: number[] = [];
  table.rows.forEach((row, rowIndex) => {
    row.cells.forEach(key => {
      const {columnSpan, rowSpan} = Table.getCell(table, key);
      if (rowSpan === 1) {
        columnCounts[rowIndex] = (columnCounts[rowIndex] ?? 0) + columnSpan;
      } else {
        // This cell contributes columnSpan columns to every row it's in.
        for (let r = 0; r < rowSpan; r++) {
          const index = rowIndex + r;
          columnCounts[index] = (columnCounts[index] ?? 0) + columnSpan;
        }
      }
    });
  });

  const rowCount = columnCounts.length;
  const columnCount = columnCounts.reduce((a, b) => Math.max(a, b), 0);

  const grid = new Array<CellKey>(rowCount * columnCount).fill('');
  const cells = new Map<CellKey, LayoutCell>();

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];

    let gridColumn = 0;
    for (let c = 0; c < row.cells.length; c++) {
      // Find the next free cell
      while (grid[r * columnCount + gridColumn] !== '') {
        gridColumn++;
      }

      const {key, columnSpan, rowSpan} = Table.getCell(table, row.cells[c]);
      const layoutCell: LayoutCell = {
        key,
        homeRow: r,
        homeColumn: gridColumn,
        indexInRow: c,
        rowSpan,
        columnSpan,
      };
      fillLayoutGrid(grid, columnCount, layoutCell);
      cells.set(key, layoutCell);
    }
  }

  return {rowCount, columnCount, grid, cells};
};

export default buildLayout;
