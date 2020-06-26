import produce, {Draft, castDraft} from 'immer';

import genId from '@condict/gen-id';

import buildLayout from './build-layout';
import buildSelectionShape from './build-selection-shape';

/**
 * Contains base table data - that is, table data that is not calculated
 * automatically.
 */
export interface TableBase<D> {
  /**
   * The default cell data, used when there is no matching entry in cellData.
   */
  readonly defaultData: D;
  /** The cells of the table, indexed by cell key, in no particular order. */
  readonly cells: ReadonlyMap<CellKey, Cell>;
  /**
   * The cells of the table laid out into their respective rows, exactly how
   * HTML expects it. Cells that span multiple rows are present only in their
   * "home" row, that is, the first row they occur in. Likewise, cells that
   * span multiple columns are only present once in their home row.
   */
  readonly rows: readonly Row[];
  /** Custom data associated with each cell. */
  readonly cellData: ReadonlyMap<CellKey, D>;
  /** The current selection range. */
  readonly selection: Selection;

  // Provided methods.

  /** Determines whether a cell is empty. */
  readonly isCellEmpty: IsCellEmptyFn<D>;
}

export type IsCellEmptyFn<D> = (data: D) => boolean;

/** The type of a cell's key. It's a short string value. */
export type CellKey = string;

/** Generates a cell key. */
export const CellKey = genId;

/**
 * A single row in the table. Note that this contains the cell key only - the
 * cell itself should be looked up through the table's `cells` map.
 */
export interface Row {
  readonly key: RowKey;
  readonly cells: readonly CellKey[];
}

/** The type of a row's key. It's a short string value. */
export type RowKey = string;

/** Generates a row key. */
export const RowKey = genId;

/** A single cell. */
export interface Cell {
  /** The cell key, which must be unique within the table. */
  readonly key: CellKey;
  /** True if the cell is a header cell. */
  readonly header: boolean;
  /** The cell's row span. This number must be greater than zero. */
  readonly rowSpan: number;
  /** The cell's column span. This number must be greater than zero. */
  readonly columnSpan: number;
}

export const Cell = {
  from(prototype: Cell): Cell {
    return {
      key: CellKey(),
      header: prototype.header,
      columnSpan: 1,
      rowSpan: 1,
    };
  },
};

export interface Selection {
  /**
   * The start of the selection, i.e. the cell that does not move when the
   * selection is extended.
   */
  readonly anchor: CellKey;
  /**
   * The "end" of the selection, i.e. the cell that moves when the selection
   * is extended.
   */
  readonly focus: CellKey;
}

export const Selection = Object.assign(
  (focus: CellKey, anchor = focus): Selection => ({
    anchor,
    focus,
  }),
  {
    /**
     * Moves the selection's focus.
     * @param selection The selection.
     * @param nextFocus The next cell to be focused.
     * @param extendSelection True to extend the selection (as if holding down
     *        the shift key), false to collapse the selection to a single cell.
     * @return The new selection.
     */
    moveFocus(
      selection: Selection,
      nextFocus: string,
      extendSelection: boolean
    ): Selection {
      // We need to update the selection if
      //   1. the focused cell has changed, obviously; or
      //   2. extendSelection is false *and* more than one cell is selected.
      // The latter ensures that clicking a single cell without holding down shift
      // will reduce the selection to that cell only. Likewise, pressing an arrow
      // key without holding shift will select only a single cell, *even if* you
      // are at an edge and the focus doesn't move.
      if (
        selection.focus !== nextFocus ||
        !extendSelection && selection.anchor !== selection.focus
      ) {
        const nextAnchor = extendSelection ? selection.anchor : nextFocus;
        return Selection(nextFocus, nextAnchor);
      }
      return selection;
    },
  }
);

/** A full table, with derived properties included. */
export interface Table<D> extends TableBase<D> {
  /**
   * Traversable layout data, derived from the table's cells. This data should
   * never be manipulated manually; it is updated automatically.
   */
  readonly layout: Layout;
  /**
   * The selection shape, derived from the table's cells and the selection
   * range. This data should never be manipulated manually; it is updated
   * automatically.
   */
  readonly selectionShape: SelectionShape;
}

const cellNotFound = (key: CellKey): never => {
  throw new Error(`Cell with key '${key}' not found in this table`);
};

export interface TableOps {
  /** Creates a table from base data. */
  fromBase<D>(base: TableBase<D>): Table<D>;

  /**
   * Mutates a table, returning the updated table.
   * @param table The table to mutate.
   * @param updater A function that updates the table draft.
   * @return The new table.
   */
  update<D>(table: Table<D>, updater: TableUpdater<D>): Table<D>;

  /**
   * Gets a cell from a table.
   * @param table The table to get the cell from.
   * @param key The key to look up.
   * @return The cell.
   * @throws Error: No cell with the given key.
   */
  getCell<D>(table: TableBase<D>, key: CellKey): Cell;
  /**
   * Gets a cell draft from a table draft.
   * @param table The table to get the cell from.
   * @param key The key to look up.
   * @return The cell draft.
   * @throws Error: No cell with the given key.
   */
  getCell<D>(table: Draft<TableBase<D>>, key: CellKey): Draft<Cell>;

  /**
   * Gets a cell's data, or the default data if the cell has none.
   * @param table The table to get the cell data from.
   * @param key The key to look up.
   * @return The cell data. If there is no data for the cell, the table's
   *         `defaultData` is returned.
   */
  getData<D>(table: TableBase<D>, key: CellKey): D;

  /**
   * Updates a cell's data. If the cell has no data, en entry will be inserted.
   * @param table The table to get the cell data from.
   * @param key The key to look up.
   * @param updater A function that updates the data draft.
   * @return The cell data. If there is no data for the cell, the table's
   *         `defaultData` is drafted, and the result is inserted into
   *         the table.
   */
  updateData<D>(
    table: Draft<TableBase<D>>,
    key: CellKey,
    updater: DataUpdater<D>
  ): void;

  /**
   * Calculates the index within a row that a cell would have to be inserted at
   * in order to end up at the specified visual row and column.
   * @param table The table.
   * @param row The rendered row that the cell will be shown at.
   * @param column The rendered column that the cell will be shown at.
   * @return The index within the row's `cells` array that the cell should be
   *         inserted at.
   */
  findCellInsertIndex<D>(
    table: Table<D> | Draft<Table<D>>,
    row: number,
    column: number
  ): number;

  /**
   * Finds the first cell in the table's current selection that matches a
   * predicate, or null if no cell matches. The table is traversed in visual
   * order, starting at the top left corner and working left-to-right,
   * top-to-bottom.
   * @param table The table.
   * @param pred The predicate. It receives both the cell and the cell's data.
   * @return The first matching cell, or null if none matched.
   */
  findFirstSelectedCell<D>(
    table: Table<D>,
    pred: (cell: Cell, data: D) => boolean
  ): Cell | null;
  /**
   * Finds the first cell in the table draft's current selection that matches a
   * predicate, or null if no cell matches. The table is traversed in visual
   * order, starting at the top left corner and working left-to-right,
   * top-to-bottom.
   * @param table The table.
   * @param pred The predicate. It receives both the cell and the cell's data.
   * @return The first matching cell draft, or null if none matched.
   */
  findFirstSelectedCell<D>(
    table: Draft<Table<D>>,
    pred: (cell: Cell, data: D) => boolean
  ): Draft<Cell> | null;

  /**
   * Finds the first non-empty cell in the table's current selection. If there
   * is no non-empty cell in the selection, the currently focused cell is
   * returned instead.
   * @param table The table.
   * @return The cell.
   */
  findFirstNonEmptyCell<D>(table: Table<D>): Cell;
  /**
   * Finds the first non-empty cell in the table draft's current selection. If
   * there is no non-empty cell in the selection, the currently focused cell is
   * returned instead.
   * @param table The table.
   * @return The cell draft.
   */
  findFirstNonEmptyCell<D>(table: Draft<Table<D>>): Draft<Cell>;
}

export type TableUpdater<D> = (table: Draft<Table<D>>) => Table<D> | void;

export type DataUpdater<D> = (data: Draft<D>) => D | void;

export const Table: TableOps = {
  fromBase<D>(base: TableBase<D>): Table<D> {
    const layout = Layout.build(base);
    const selectionShape = SelectionShape.build(base, layout);
    return {
      ...base,
      layout,
      selectionShape,
    };
  },

  update<D>(prevTable: Table<D>, updater: TableUpdater<D>): Table<D> {
    let nextTable = produce(prevTable, updater);

    if (
      nextTable.cells !== prevTable.cells ||
      nextTable.rows !== prevTable.rows
    ) {
      nextTable = produce(nextTable, Layout.update);
    }

    if (
      nextTable.selection !== prevTable.selection ||
      nextTable.layout !== prevTable.layout
    ) {
      nextTable = produce(nextTable, SelectionShape.update);
    }

    return nextTable;
  },

  getCell<D>(
    table: TableBase<D> | Draft<TableBase<D>>,
    key: CellKey
  ): Cell | Draft<Cell> {
    return table.cells.get(key) || cellNotFound(key);
  },

  getData<D>(table: TableBase<D>, key: CellKey): D {
    return table.cellData.get(key) || table.defaultData;
  },

  updateData<D>(
    table: Draft<TableBase<D>>,
    key: CellKey,
    updater: DataUpdater<D>
  ): void {
    const data = table.cellData.get(key);
    if (data) {
      const nextData = updater(data);
      if (nextData !== undefined) {
        table.cellData.set(key, castDraft(nextData));
      }
    } else {
      const nextData = produce(table.defaultData, updater) as Draft<D>;
      table.cellData.set(key, nextData);
    }
  },

  findCellInsertIndex<D>(
    table: Table<D> | Draft<Table<D>>,
    row: number,
    column: number
  ): number {
    const {layout} = table;

    for (let leftCol = column - 1; leftCol >= 0; leftCol--) {
      const layoutCell = Layout.getCellAt(layout, row, leftCol) as LayoutCell;
      if (layoutCell.homeRow === row) {
        // The cell starts in (i.e. belongs to) this row, so the new cell will
        // be inserted to the right of it.
        return layoutCell.indexInRow + 1;
      }
    }

    // col is 0 or the row is empty to the left of the cell.
    return 0;
  },

  findFirstSelectedCell<D>(
    table: Table<D> | Draft<Table<D>>,
    pred: (cell: Cell, data: D) => boolean
  ): Cell | Draft<Cell> | null {
    const {selectionShape: sel, layout} = table;

    for (let r = sel.minRow; r <= sel.maxRow; r++) {
      for (let c = sel.minColumn; c <= sel.maxColumn; ) {
        const layoutCell = Layout.getCellAt(layout, r, c);

        // Don't try each cell more than once.
        if (r === layoutCell.homeRow) {
          const cell = Table.getCell(table as Table<D>, layoutCell.key);
          const data = Table.getData(table as Table<D>, layoutCell.key);
          if (pred(cell, data)) {
            return cell;
          }
        }

        c += layoutCell.columnSpan;
      }
    }

    return null;
  },

  findFirstNonEmptyCell<D>(
    table: Table<D> | Draft<Table<D>>
  ): Cell | Draft<Cell> {
    const cell = Table.findFirstSelectedCell(
      table as Table<D>,
      (_cell, data) => !table.isCellEmpty(data)
    );
    if (cell) {
      return cell;
    }

    // All empty cells: use the focused cell as the prototype.
    return Table.getCell(table as Table<D>, table.selection.focus);
  },
};

/** Grid layout for traversal. */
export interface Layout {
  /** The total number of *rendered* rows in the table. */
  readonly rowCount: number;
  /** The total number of *rendered* columns in the table. */
  readonly columnCount: number;
  /**
   * Array of layout cell keys traversable as a 2D grid.
   *
   * Cell index = row * columnCount + column.
   */
  readonly grid: readonly CellKey[];
  /** Map of layout cells indexed by cell key. */
  readonly cells: ReadonlyMap<CellKey, LayoutCell>;
}

export const Layout = {
  build<D>(base: TableBase<D>): Layout {
    return buildLayout(base as TableBase<unknown>);
  },

  update(table: Draft<Table<unknown>>): void {
    table.layout = castDraft(buildLayout(table));
  },

  getCellAt(layout: Layout, row: number, column: number): LayoutCell {
    const key = layout.grid[row * layout.columnCount + column];
    return layout.cells.get(key) || cellNotFound(key);
  },

  getCellByKey(layout: Layout, key: CellKey): LayoutCell {
    return layout.cells.get(key) || cellNotFound(key);
  },
};

/** Computed layout for a single cell. */
export interface LayoutCell {
  /** The key of the cell that this layout cell describes. */
  readonly key: CellKey;
  /** The rendered row that cell starts in. */
  readonly homeRow: number;
  /** The rendered column that the cell starts in. */
  readonly homeColumn: number;
  /**
   * The cell's index within its owning row, stored here to avoid O(n) lookups
   * in various places.
   */
  readonly indexInRow: number;
  /**
   * The cell's row span, copied from the Cell to avoid extraneous lookups.
   */
  readonly rowSpan: number;
  /**
   * The cell's column span, copied from the Cell to avoid extraneous lookups.
   */
  readonly columnSpan: number;
}

/** The shape of the table's selection. */
export interface SelectionShape {
  /**
   * The start of the selection, i.e. the cell that does not move when the
   * selection is extended. Copied here from Selection to avoid extraneous
   * lookups.
   */
  readonly anchor: CellKey;
  /**
   * The "end" of the selection, i.e. the cell that moves when the selection
   * is extended. Copied here from Selection to avoid extraneous lookups.
   */
  readonly focus: CellKey;
  /** The (rendered) start row of the selection. */
  readonly minRow: number;
  /** The (rendered) last row of the selection, inclusive. */
  readonly maxRow: number;
  /** The (rendered) start column of the selection. */
  readonly minColumn: number;
  /** The (rendered) last column of the selection, inclusive. */
  readonly maxColumn: number;
  /** Keys of all selected cells. */
  readonly cells: ReadonlySet<CellKey>;
}

export const SelectionShape = {
  build<D>(base: TableBase<D>, layout: Layout): SelectionShape {
    return buildSelectionShape(base as TableBase<unknown>, layout);
  },

  update(table: Draft<Table<unknown>>): void {
    table.selectionShape = castDraft(buildSelectionShape(
      table as Table<unknown>,
      table.layout
    ));
  },
};

export interface StandardRow<C> {
  readonly cells: readonly C[];
}
