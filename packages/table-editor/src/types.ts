import {ReactNode} from 'react';

import Selection from './value/selection';

export type Messages = {
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
  describeSelection(selection: Selection): string;
};
