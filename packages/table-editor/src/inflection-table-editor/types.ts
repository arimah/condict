import {Draft} from 'immer';

import {Table, Cell, CellKey, StandardRow, convertStandardTable} from '../value';
import {Messages as EditorMessages} from '../types';

import {getDerivedName} from './operations';

export type InflectionTableJson = InflectionTableRowJson[];

export type InflectionTableRowJson = StandardRow<InflectionTableCellJson>;

export interface InflectionTableCellJson {
  readonly columnSpan?: number;
  readonly rowSpan?: number;
  readonly headerText?: string;
  readonly inflectedForm?: InflectedFormJson;
}

export interface InflectedFormJson {
  readonly id: number | null;
  readonly inflectionPattern: string;
  readonly deriveLemma: boolean;
  readonly displayName: string;
  readonly hasCustomDisplayName: boolean;
}

export type InflectionTable = Table<InflectionTableData>;

export const InflectionTable = {
  fromJson(rows: InflectionTableJson): InflectionTable {
    return convertStandardTable(
      rows,
      DefaultData,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      InflectionTableData.isCellEmpty,
      inputCell => {
        const cell: Cell = {
          key: CellKey(),
          rowSpan: inputCell.rowSpan || 1,
          columnSpan: inputCell.columnSpan || 1,
          // It's a header cell if there is no inflected form.
          header: !inputCell.inflectedForm,
        };
        let data: InflectionTableData;
        const form = inputCell.inflectedForm;
        if (form) {
          data = {
            text: form.inflectionPattern,
            deriveLemma: form.deriveLemma,
            displayName: form.displayName,
            hasCustomDisplayName: form.hasCustomDisplayName,
            inflectedFormId: form.id,
          };
        } else {
          data = {
            ...DefaultData,
            text: inputCell.headerText || '',
          };
        }
        return [cell, data];
      }
    );
  },

  export(table: InflectionTable): InflectionTableJson {
    return table.rows.map(row => ({
      cells: row.cells.map(cellKey => {
        const cell = Table.getCell(table, cellKey);
        const data = Table.getData(table, cellKey);
        const result: Draft<InflectionTableCellJson> = {};
        if (cell.rowSpan > 1) {
          result.rowSpan = cell.rowSpan;
        }
        if (cell.columnSpan > 1) {
          result.columnSpan = cell.columnSpan;
        }
        if (cell.header) {
          result.headerText = data.text;
        } else {
          // FIXME: This is really inefficient for larger tables.
          const displayName = data.hasCustomDisplayName
            ? data.displayName
            : getDerivedName(table, cellKey);

          result.inflectedForm = {
            id: data.inflectedFormId,
            inflectionPattern: data.text,
            deriveLemma: data.deriveLemma,
            displayName,
            hasCustomDisplayName: data.hasCustomDisplayName,
          };
        }
        return result;
      }),
    }));
  },
};

export interface InflectionTableData {
  /** The text of a header cell or the inflection pattern in a data cell. */
  readonly text: string;
  // The below apply only to inflected forms (i.e. data cells)
  /** On a data cell, whether to derive a lemma for the inflected form. */
  readonly deriveLemma: boolean;
  /** The display name of a data cell; the name of the inflected form. */
  readonly displayName: string;
  /**
   * True if a data cell has a custom display name; false if it was derived
   * automatically.
   */
  readonly hasCustomDisplayName: boolean;
  /** The inflected form ID. */
  readonly inflectedFormId: number | null;
}

export const InflectionTableData = {
  isCellEmpty(data: InflectionTableData): boolean {
    return /^\s*$/.test(data.text);
  },
};

const DefaultData: InflectionTableData = {
  text: '',
  deriveLemma: true,
  displayName: '',
  hasCustomDisplayName: false,
  inflectedFormId: null,
};

export type InflectionTableCommandFn =
  (table: InflectionTable) => InflectionTable;

export interface Messages extends EditorMessages {
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
}
