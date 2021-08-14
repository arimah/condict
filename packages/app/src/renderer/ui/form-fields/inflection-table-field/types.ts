import {
  InflectionTable,
  InflectionTableJson,
  Table,
  Selection,
} from '@condict/table-editor';

import {InflectionTableRowInput} from '../../../graphql';

/*
 * The base InflectionTable contains three extra properties – `selection`,
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

export type InflectionTableValue = {
  readonly version: number;
} & Omit<
  InflectionTable,
  'selection' | 'layout' | 'selectionShape'
>;

export const InflectionTableValue = {
  empty(): InflectionTableValue {
    // Generic empty table
    return InflectionTableValue.fromGraphQLResponse([
      {
        cells: [
          {
            inflectedForm: {
              id: null,
              inflectionPattern: '',
              deriveLemma: true,
              displayName: '',
              hasCustomDisplayName: false,
            },
          },
        ],
      },
    ]);
  },

  fromTable(table: InflectionTable, version = 0): InflectionTableValue {
    return {
      cellData: table.cellData,
      cells: table.cells,
      defaultData: table.defaultData,
      isCellEmpty: table.isCellEmpty,
      rows: table.rows,
      version,
    };
  },

  toTable(value: InflectionTableValue): InflectionTable {
    return Table.fromBase({
      ...value,
      selection: Selection(value.rows[0].cells[0]),
    });
  },

  fromGraphQLResponse(rows: InflectionTableJson): InflectionTableValue {
    return InflectionTableValue.fromTable(InflectionTable.fromJson(rows));
  },

  toGraphQLInput(value: InflectionTableValue): InflectionTableRowInput[] {
    const table = InflectionTableValue.toTable(value);
    return InflectionTable.export(table) as InflectionTableRowInput[];
  },
} as const;
