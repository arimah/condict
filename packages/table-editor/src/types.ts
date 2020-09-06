import {ReactNode, ComponentType} from 'react';

import {Table, Cell, SelectionShape} from './value';

export interface EditorContextValue<D, M extends Messages> {
  /** The cell editor component, rendered once for the cell being edited. */
  readonly CellEditor: ComponentType<CellEditorProps<D, M>>;
  /** The cell data component, rendered once for each cell. */
  readonly CellData: ComponentType<CellDataProps<D>>;
  /** The editor's context menu component, rendered on demand. */
  readonly ContextMenu: ComponentType<ContextMenuProps<D, M>>;
  /** Determines whether multiple cells can be selected. */
  readonly multiSelect: boolean;
  /** Determines whether the specified cell can be edited. */
  readonly canEditCell: (cell: Cell, data: D) => boolean;
  /** Describes the specified cell. */
  readonly describeCell: (messages: M, cell: Cell, data: D) => string;
  /** Determines whether the table has a context value. */
  readonly hasContextMenu: (table: Table<D>) => boolean;
}

export type CellEditorProps<D, M extends Messages> = {
  id: string;
  initial: CellWithData<D>;
  typedValue: string;
  table: Table<D>;
  messages: M;
  onInput: CellEditFn<D>;
  onCommit: CellEditFn<D>;
};

export type CellEditFn<D> = (cell: CellWithData<D>) => void;

export type CellDataProps<D> = {
  cell: Cell;
  data: D;
  editing: boolean;
  disabled: boolean;
};

export type ContextMenuProps<D, M extends Messages> = {
  table: Table<D>;
  messages: M;
};

export interface CellWithData<D> {
  readonly cell: Cell;
  readonly data: D;
}

export interface Messages {
  /**
   * "Press <b>Enter</b> or <b>F2</b> to edit the current cell.", visible helper
   * text beneath the table (when cell editor dialog is closed).
   */
  tableEditorHelper(): ReactNode;
  /**
   * "Press <b>Enter</b> or <b>ESC</b> when done.", visible helper text beneath
   * the table (when cell editor dialog is open).
   */
  cellEditorHelper(): ReactNode;
  /**
   * "Press enter or escape to save and return.", SR-only helper text in cell
   * editor dialog.
   */
  cellEditorSRHelper(): string;
  /** "Edit cell", SR-only title of cell editor dialog. */
  cellEditorTitle(): string;
  /** "Cell value", SR-only label of cell value input. */
  cellValueLabel(): string;
  /**
   * SR-only description of the current selection, along the lines of:
   *   - "4 cells selected: column 2 through 5, row 4"
   *   - "3 cells selected: column 1, row 3 through 5"
   *   - "6 cells selected: column 1 through 3, row 7 through 8"
   * This string is only used when more than one cell is selected.
   */
  describeSelection(selection: SelectionShape): string;
}
