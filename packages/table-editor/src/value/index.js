import {Record, List} from 'immutable';

import pathToCell from '../value-helpers/path-to-cell';

import Layout from './layout';
import Selection from './selection';

export const Row = Record({
  key: null,
  cells: List(),
});

export const CellOf = Data => {
  const Cell = Record({
    key: null,
    header: false,
    columnSpan: 1,
    rowSpan: 1,
    data: Data(),
  });
  Cell.Data = Data;
  return Cell;
};

export default class Value {
  constructor(rows, layout, selection) {
    this.rows = rows;
    this.layout = layout || new Layout(rows);
    this.selection = selection || new Selection(this.layout);
  }

  make(
    rows = null,
    layout = null,
    selection = null
  ) {
    return new this.constructor(rows, layout, selection);
  }

  isCellEmpty(_cell) {
    throw new Error('Unimplemented method: isCellEmpty()');
  }

  emptyData() {
    throw new Error('Unimplemented method: emptyData()');
  }

  createCellFrom(_protoCell) {
    throw new Error('Unimplemented method: createCellFrom()');
  }

  getCell(key) {
    const layoutCell = this.layout.cellFromKey(key);
    if (key) {
      return this.rows
        .get(layoutCell.row)
        .cells
        .get(layoutCell.colIndex);
    }
    return null;
  }

  withSelection(selection) {
    return this.make(
      this.rows,
      this.layout,
      selection
    );
  }

  withFocusedCell(newFocusedCellKey, extendSelection = false) {
    const {focusedCellKey, selectedCells, selectionStart} = this.selection;
    // We need to update the state if
    //   1. the focused cell has changed
    //   2. extendSelection is false *and* more than one cell is selected.
    // The latter ensures that clicking a single cell without holding down shift
    // will reduce the selection to that cell only. Likewise, pressing an arrow
    // key without holding shift will select only a single cell, *even if* you
    // are at an edge and the focus doesn't move.
    if (
      newFocusedCellKey !== focusedCellKey ||
      !extendSelection && selectedCells.size > 1
    ) {
      const newSelectionStart = extendSelection
        ? selectionStart
        : newFocusedCellKey;

      return this.withSelection(new Selection(
        this.layout,
        newFocusedCellKey,
        newSelectionStart
      ));
    }
    return this;
  }

  updateCellData(key, newCell) {
    const layoutCell = this.layout.cellFromKey(key);
    if (!layoutCell) {
      throw new Error(`Cell not found: ${key}`);
    }

    // The kinds of changes permitted by this method do not change
    // the table layout or selection, so we can reuse those.
    return this.make(
      this.rows.updateIn(pathToCell(layoutCell), cell =>
        newCell
          .set('key', cell.key)
          .set('rowSpan', cell.rowSpan)
          .set('columnSpan', cell.columnSpan)
      ),
      this.layout,
      this.selection
    );
  }

  findFirstNonEmptySelectedCell() {
    const {selection, layout} = this;

    for (let r = selection.minRow; r <= selection.maxRow; r++) {
      for (let c = selection.minCol; c <= selection.maxCol; c++) {
        const layoutCell = layout.cellFromPosition(r, c);
        const cell = this.rows
          .get(layoutCell.row)
          .cells
          .get(layoutCell.colIndex);
        if (!this.isCellEmpty(cell)) {
          return cell;
        }
      }
    }

    // All empty cells: use the focused cell as the prototype.
    return this.getCell(selection.focusedCellKey);
  }

  findCellInsertIndex(row, col) {
    const {layout} = this;

    for (let leftCol = col - 1; leftCol >= 0; leftCol--) {
      const layoutCell = layout.cellFromPosition(row, leftCol);
      if (layoutCell.row === row) {
        // The cell starts in (i.e. belongs to) this row, so the new cell will
        // be inserted to the right of it.
        return layoutCell.colIndex + 1;
      }
    }

    // col is 0 or the row is empty to the left of the cell.
    return 0;
  }
}
