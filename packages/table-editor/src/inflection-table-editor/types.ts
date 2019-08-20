export type DataFields = {
  text: string;
  // The below apply only to inflected forms (i.e. data cells)
  deriveLemma: boolean;
  displayName: string;
  hasCustomDisplayName: boolean;
  inflectedFormId: number | null;
};

export type InflectionTableJson = InflectionTableJsonRow[];

export type InflectionTableJsonRow = {
  cells: InflectionTableJsonCell[];
};

export type InflectionTableJsonCell = {
  columnSpan?: number;
  rowSpan?: number;
  headerText?: string;
  inflectedForm?: {
    id: string | null;
    inflectionPattern: string;
    deriveLemma: boolean;
    displayName: string;
    hasCustomDisplayName: boolean;
  };
};

export type Messages = {
  /** "Not added to the dictionary.", SR-only description of a cell. */
  noDerivedLemma(): string;
  /** "Form has custom name.", SR-only description of a cell. */
  hasCustomName(): string;
  /** "Header cell", checkbox in cell editor dialog. */
  headerCellOption(): string;
  /** "Add form to dictionary", checkbox in cell editor dialog. */
  deriveLemmaOption(): string;
  /** "Name of this form:", input label in cell editor dialog. */
  formNameLabel(): string;
  /** "Use automatic name", button in cell editor dialog. */
  useAutomaticNameButton(): string;
  /**
   * "The name is calculated automatically. Type here to change it.", helper
   * text shown in cell editor dialog.
   */
  automaticNameHelper(): string;
  /**
   * "Header cell" or "Header cells", checkable context menu item.
   * @param n The number of selected cells.
   */
  headerCellMenu(n: number): string;
  /**
   * "Add form to dictionary" or "Add forms to dictionary", checkable context
   * menu item.
   * @param n The number of selected cells.
   */
  deriveLemmaMenu(n: number): string;
  /** "Merge cells", context menu item. */
  mergeCells(): string;
  /** "Separate cells", context menu item. */
  separateCells(): string;
  /** "Insert", context menu item with submenu. */
  insertSubmenu(): string;
  /** "Row above", context menu item inside "Insert" submenu. */
  insertRowAbove(): string;
  /** "Row below", context menu item inside "Insert" submenu. */
  insertRowBelow(): string;
  /** "Column before", context menu item inside "Insert" submenu. */
  insertColumnBefore(): string;
  /** "Column after", context menu item inside "Insert" submenu. */
  insertColumnAfter(): string;
  /**
   * "Delete row" or "Delete N rows", context menu item.
   * @param n The number of selected rows.
   */
  deleteRows(n: number): string;
  /**
   * "Delete column" or "Delete N columns", context menu item.
   * @param n The number of selected columns.
   */
  deleteColumns(n: number): string;
};
