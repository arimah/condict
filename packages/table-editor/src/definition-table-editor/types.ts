import {Table, Cell, CellKey, StandardRow, convertStandardTable} from '../value';
import {Messages as EditorMessages} from '../types';

export type DefinitionTableJson = DefinitionTableRowJson[];

export type DefinitionTableRowJson = StandardRow<DefinitionTableCellJson>;

export interface DefinitionTableCellJson {
  readonly columnSpan?: number;
  readonly rowSpan?: number;
  readonly headerText?: string;
  readonly inflectedForm?: DefinitionInflectedFormJson;
}

export interface DefinitionInflectedFormJson {
  readonly id: number | null;
  readonly inflectionPattern: string;
}

export type DefinitionTable = Table<DefinitionTableData>;

export const DefinitionTable = {
  fromJson(
    rows: DefinitionTableJson,
    customForms: ReadonlyMap<number, string>
  ): DefinitionTable {
    return convertStandardTable(
      rows,
      DefaultData,
      () => false,
      inputCell => {
        const cell: Cell = {
          key: CellKey(),
          rowSpan: inputCell.rowSpan || 1,
          columnSpan: inputCell.columnSpan || 1,
          // It's a header cell if there is no inflected form.
          header: !inputCell.inflectedForm,
        };
        let data: DefinitionTableData;
        const form = inputCell.inflectedForm;
        if (form) {
          data = {
            text: form.inflectionPattern,
            customForm: form.id !== null && customForms.has(form.id)
              ? customForms.get(form.id) as string
              : null,
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

  exportCustomForms(table: DefinitionTable): Map<number, string> {
    const result = new Map<number, string>();

    for (const [cellKey, data] of table.cellData) {
      const cell = Table.getCell(table, cellKey);
      if (
        !cell.header &&
        data.inflectedFormId !== null &&
        data.customForm !== null
      ) {
        result.set(data.inflectedFormId, data.customForm);
      }
    }

    return result;
  },
};

export interface DefinitionTableData {
  /** Header text or inflection pattern. */
  readonly text: string;
  /**
   * Custom inflected form (data cells only). If the form has been deleted,
   * this field is set to the empty string. Null means to use the default
   * inflected form.
   */
  readonly customForm: string | null;
  /**
   * The inflected form ID that the custom form overrides, or null for header
   * cells.
   */
  readonly inflectedFormId: number | null;
}

const DefaultData: DefinitionTableData = {
  text: '',
  customForm: null,
  inflectedFormId: null,
};

export interface StemsContextValue {
  readonly term: string;
  readonly stems: ReadonlyMap<string, string>;
}

export interface Messages extends EditorMessages {
  /** "Form is inflected automatically.", SR-only description of a cell. */
  formIsInflected(): string;
  /** "Form is deleted.", SR-only description of a cell. */
  formIsDeleted(): string;
  /** "Custom form.", SR-only description of a cell. */
  customForm(): string;
  /**
   * "Type here to define a custom form", SR-only helper text in cell editor
   * dialog.
   */
  cellDialogInputHelper(): string;
  /** "Revert to default form", button in cell editor dialog. */
  useDefaultFormButton(): string;
  /** "Use default form", context menu item. */
  useDefaultFormMenu(): string;
  /** "Delete this form", context menu item. */
  deleteThisForm(): string;
}
