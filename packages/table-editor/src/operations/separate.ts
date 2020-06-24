import {Draft} from 'immer';

import {Table, Cell, CellKey, Layout, LayoutCell, Selection} from '../value';

const separateCell = <D>(
  table: Draft<Table<D>>,
  layoutCell: LayoutCell,
  row: number
): CellKey | null => {
  const exitingCell = Table.getCell(table, layoutCell.key);
  const {homeRow, homeColumn: column, columnSpan} = layoutCell;
  // This is the index in the row's `cells` list that we insert the new
  // cells at. It's the index of whatever cell is to the left of the
  // merged cell, plus one. On the row that the merged cell belongs to,
  // we know that's `indexInRow`; in all other cases, we have to walk
  // through the table layout to find said cell.
  const insertIndex = row === homeRow
    ? layoutCell.indexInRow
    : Table.findCellInsertIndex(table, row, column);

  let nextFocus: CellKey | null = null;
  for (let c = 0; c < columnSpan; c++) {
    let newCell: Cell;
    if (row === homeRow && c === 0) {
      // The existing cell can be updated in place.
      exitingCell.rowSpan = 1;
      exitingCell.columnSpan = 1;
      newCell = exitingCell;
    } else {
      // Let's create a new cell!
      newCell = {
        ...exitingCell,
        key: CellKey(),
        rowSpan: 1,
        columnSpan: 1,
      };
      table.cells.set(newCell.key, newCell);
      table.rows[row].cells.splice(insertIndex + c, 0, newCell.key);
    }
    if (
      row === table.selectionShape.maxRow &&
      column + c === table.selectionShape.maxColumn
    ) {
      nextFocus = newCell.key;
    }
  }
  return nextFocus;
};

const separate = <D>(
  table: Table<D>
): Table<D> => {
  // If none of the selected cells spans multiple rows or columns, there's
  // nothing to separate, so we don't have to do anything!
  let hasMergedCells = false;
  table.selectionShape.cells.forEach(key => {
    if (!hasMergedCells) {
      const layoutCell = Layout.getCellByKey(table.layout, key);
      hasMergedCells =
        layoutCell.columnSpan > 1 ||
        layoutCell.rowSpan > 1;
    }
  });
  if (!hasMergedCells) {
    return table;
  }

  return Table.update(table, table => {
    const {selectionShape: sel, layout} = table;

    let nextAnchor = sel.anchor;
    let nextFocus = sel.focus;
    for (let r = sel.minRow; r <= sel.maxRow; r++) {
      for (let c = sel.maxColumn; c >= sel.minColumn; ) {
        const layoutCell = Layout.getCellAt(layout, r, c);

        const isMerged = layoutCell.columnSpan > 1 || layoutCell.rowSpan > 1;
        if (isMerged) {
          nextFocus = separateCell(table, layoutCell, r) || nextFocus;
        } else if (r === sel.maxRow && c === sel.maxColumn) {
          nextFocus = layoutCell.key;
        }

        if (r === sel.minRow && c === sel.minColumn) {
          nextAnchor = layoutCell.key;
        }

        c -= layoutCell.columnSpan;
      }
    }

    table.selection = Selection(nextFocus, nextAnchor);
  });
};

export default separate;
