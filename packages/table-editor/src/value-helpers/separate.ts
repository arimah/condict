import {List} from 'immutable';

import Value, {ValueData} from '../value';
import Layout from '../value/layout';
import Selection from '../value/selection';
import {Row, Cell, LayoutCell} from '../value/types';

const separateCell = <V extends Value<any>>(
  value: V,
  newRows: List<Row<ValueData<V>>>,
  layoutCell: LayoutCell
) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const cell = value.rows
    .get(layoutCell.row)!
    .cells
    .get(layoutCell.colIndex)!
    // Reset the rowSpan and columnSpan too
    .set('rowSpan', 1)
    .set('columnSpan', 1);

  const maxRow = layoutCell.row + layoutCell.rowSpan - 1;
  for (let r = layoutCell.row; r <= maxRow; r++) {
    // This is the index in the row's `cells` list that we insert the new
    // cells at. It's the index of whatever cell is to the left of the
    // merged cell, plus one. On the row that the merged cell belongs to,
    // we know that's `colIndex`; in all other cases, we have to walk
    // through the table layout to find said cell.
    const insertIndex = r === layoutCell.row
      ? layoutCell.colIndex
      : value.findCellInsertIndex(r, layoutCell.col);

    for (let c = 0; c < layoutCell.columnSpan; c++) {
      if (r === layoutCell.row && c === 0) {
        // The existing cell can be updated in-place.
        newRows = newRows.setIn([r, 'cells', insertIndex], cell);
      } else {
        // This is a brand new cell, so it needs to be inserted, and we
        // also have to clear its data and give it a new key.
        const newCell = value.createCellFrom(cell);
        newRows = newRows.updateIn(
          [r, 'cells'],
          (cells: List<Cell<ValueData<V>>>) =>
            cells.insert(insertIndex + c, newCell)
        );
      }
    }
  }

  return newRows;
};

const separate = <V extends Value<any>>(value: V) => {
  const {selection, layout} = value;

  // If none of the selected cells spans multiple rows or columns, there's
  // nothing to separate, so we don't have to do anything!
  let hasMergedCells = false;
  selection.selectedCells.forEach(key => {
    if (!hasMergedCells) {
      const layoutCell = layout.cellFromKey(key) as LayoutCell;
      hasMergedCells =
        layoutCell.columnSpan > 1 ||
        layoutCell.rowSpan > 1;
    }
  });
  if (!hasMergedCells) {
    return value;
  }

  let newRows = value.rows;
  for (let r = selection.minRow; r <= selection.maxRow; r++) {
    for (let c = selection.maxCol; c >= selection.minCol; ) {
      const layoutCell = layout.cellFromPosition(r, c);

      const isMerged = layoutCell.columnSpan > 1 || layoutCell.rowSpan > 1;
      if (isMerged && r === layoutCell.row) {
        newRows = separateCell(value, newRows, layoutCell);
      }

      c -= layoutCell.columnSpan;
    }
  }
  const newLayout = new Layout(newRows);
  const newSelection = new Selection(
    newLayout,
    newLayout.cellFromPosition(selection.maxRow, selection.maxCol).key,
    newLayout.cellFromPosition(selection.minRow, selection.minCol).key
  );
  return value.make(newRows, newLayout, newSelection);
};

export default separate;
