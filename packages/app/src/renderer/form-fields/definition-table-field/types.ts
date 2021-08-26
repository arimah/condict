import {
  DefinitionTable,
  DefinitionTableJson,
  Table,
  Selection,
} from '@condict/table-editor';

import {CustomInflectedFormInput, InflectedFormId} from '../../graphql';

/*
 * The base DefinitionTable contains three extra properties – `selection`,
 * `layout` and `selectionShape` – that control selection and traversal in the
 * table. Unfortunately, there is no way to tell react-hook-form that these
 * properties are irrelevant for calculating the dirtiness of the field, so the
 * tab will appear dirty if you so much as move the selection around inside the
 * table.
 *
 * Hence, the form value contains everything except those three properties. This
 * does lead to a bit of extra work as we destroy and recreate those things.
 * Unfortunately, react-hook-form cannot compare Maps and Sets when it
 * calculates whether the form is dirty. We add our own `version` field to keep
 * perfect track of dirtiness.
 */

export type DefinitionTableValue = {
  readonly version: number;
} & Omit<
  DefinitionTable,
  'selection' | 'layout' | 'selectionShape'
>;

export const DefinitionTableValue = {
  fromTable(table: DefinitionTable, version = 0): DefinitionTableValue {
    return {
      cellData: table.cellData,
      cells: table.cells,
      defaultData: table.defaultData,
      isCellEmpty: table.isCellEmpty,
      rows: table.rows,
      version,
    };
  },

  toTable(value: DefinitionTableValue): DefinitionTable {
    return Table.fromBase({
      ...value,
      selection: Selection(value.rows[0].cells[0]),
    });
  },

  fromGraphQLResponse(
    rows: DefinitionTableJson,
    customForms: ReadonlyMap<InflectedFormId, string>
  ): DefinitionTableValue {
    return DefinitionTableValue.fromTable(
      DefinitionTable.fromJson(rows, customForms)
    );
  },

  exportCustomForms(value: DefinitionTableValue): CustomInflectedFormInput[] {
    const table = DefinitionTableValue.toTable(value);

    const forms: CustomInflectedFormInput[] = [];
    for (const [id, value] of DefinitionTable.exportCustomForms(table)) {
      forms.push({
        inflectedFormId: id as InflectedFormId,
        value,
      });
    }
    return forms;
  },
} as const;
