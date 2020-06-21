import {Record, RecordOf, List} from 'immutable';

import pathToCell from '../value-helpers/path-to-cell';

import {Row, RowFields, Cell, CellFields} from './types';
import Layout from './layout';
import Selection from './selection';

export const CellOf = <D>(
  Data: Record.Factory<D>
): Record.Factory<CellFields<D>> =>
  Record<CellFields<D>>({
    key: '',
    header: false,
    columnSpan: 1,
    rowSpan: 1,
    data: Data(),
  });

export const makeRow = Record<RowFields<any>>({
  key: '',
  cells: List(),
});

export const RowType = <D>(
  values: Partial<RowFields<D>>
): RecordOf<RowFields<D>> =>
  (makeRow as Record.Factory<RowFields<D>>)(values);

export type ValueData<V extends Value<any>> =
  V extends Value<infer D> ? D : unknown;

export default abstract class Value<D> {
  public readonly rows: List<Row<D>>;
  public readonly layout: Layout;
  public readonly selection: Selection;

  public constructor(
    rows: List<Row<D>>,
    layout?: Layout,
    selection?: Selection
  ) {
    this.rows = rows;
    this.layout = layout || new Layout(rows);
    this.selection = selection || new Selection(this.layout);
  }

  public abstract make(
    rows?: List<Row<D>>,
    layout?: Layout,
    selection?: Selection
  ): this;

  public abstract isCellEmpty(cell: Cell<D>): boolean;

  public abstract emptyData(): RecordOf<D>;

  public abstract createCellFrom(protoCell: Cell<D>): Cell<D>;

  public getCell(key: string): Cell<D> | null {
    const layoutCell = this.layout.cellFromKey(key);
    if (layoutCell) {
      const row = this.rows.get(layoutCell.row) || null;
      const cell = row && row.cells.get(layoutCell.colIndex) || null;
      return cell;
    }
    return null;
  }

  public withSelection(selection: Selection): this {
    return this.make(
      this.rows,
      this.layout,
      selection
    );
  }

  public withFocusedCell(
    newFocusedCellKey: string | null,
    extendSelection = false
  ): this {
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

  public updateCellData(key: string, newCell: Cell<D>): this {
    const layoutCell = this.layout.cellFromKey(key);
    if (!layoutCell) {
      throw new Error(`Cell not found: ${key}`);
    }

    // The kinds of changes permitted by this method do not change
    // the table layout or selection, so we can reuse those.
    return this.make(
      this.rows.updateIn(pathToCell(layoutCell), (cell: Cell<D>) =>
        newCell
          .set('key', cell.key)
          .set('rowSpan', cell.rowSpan)
          .set('columnSpan', cell.columnSpan)
      ),
      this.layout,
      this.selection
    );
  }

  public findFirstNonEmptySelectedCell(): Cell<D> {
    const {selection, layout} = this;

    for (let r = selection.minRow; r <= selection.maxRow; r++) {
      for (let c = selection.minCol; c <= selection.maxCol; c++) {
        const layoutCell = layout.cellFromPosition(r, c);
        // eslint-disable-next-row @typescript-eslint/no-non-null-assertion
        const row = this.rows.get(layoutCell.row);
        const cell = row && row.cells.get(layoutCell.colIndex);
        if (cell && !this.isCellEmpty(cell)) {
          return cell;
        }
      }
    }

    // All empty cells: use the focused cell as the prototype.
    return this.getCell(selection.focusedCellKey) as Cell<D>;
  }

  public findCellInsertIndex(row: number, col: number): number {
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
