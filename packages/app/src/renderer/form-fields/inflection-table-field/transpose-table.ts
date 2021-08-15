import {Draft} from 'immer';

import {
  InflectionTable,
  Table,
  Row,
  RowKey,
  Cell,
  CellKey,
  Layout,
} from '@condict/table-editor';

/**
 * Transposes a table; that is, swaps its rows and columns.
 * @param table The table to transpose.
 * @return The transposed table.
 */
const transposeTable = (table: InflectionTable): InflectionTable => {
  const {layout} = table;

  return Table.update(table, draft => {
    const rows: Draft<Row>[] = [];

    for (let c = 0; c < layout.columnCount; c++) {
      const cells: CellKey[] = [];

      for (let r = 0; r < layout.rowCount; ) {
        const layoutCell = Layout.getCellAt(layout, r, c);

        if (layoutCell.homeColumn === c) {
          // The cell starts in this column. In the new table, it has to start in
          // the row we're currently building.
          const cell = Table.getCell(draft, layoutCell.key) as Draft<Cell>;

          // Swap column span and row span
          const columnSpan = cell.columnSpan;
          cell.columnSpan = cell.rowSpan;
          cell.rowSpan = columnSpan;

          cells.push(layoutCell.key);
        }

        r += layoutCell.rowSpan;
      }

      rows.push({key: RowKey(), cells});
    }

    draft.rows = rows;

    // We haven't changed any of the cell keys. The previous selection should
    // still be valid, so no need to change it here.
  });
};

export default transposeTable;
