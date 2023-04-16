/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  InflectionTableId
} from "../../graphql";

export const AllTableLayoutsQuery = "query AllTableLayoutsQuery($lang:LanguageId!){language(id:$lang){id,name,inflectionTables{id,name}}}" as Query<{
  lang: LanguageId;
}, {
  language: {
    id: LanguageId;
    name: string;
    inflectionTables: {
      id: InflectionTableId;
      name: string;
    }[];
  } | null;
}>;

export const TableLayoutQuery = "query TableLayoutQuery($table:InflectionTableId!){inflectionTable(id:$table){layout{rows{cells{columnSpan,rowSpan...on InflectionTableHeaderCell{headerText}...on InflectionTableDataCell{inflectedForm{inflectionPattern,deriveLemma,displayName,hasCustomDisplayName}}}}}}}" as Query<{
  table: InflectionTableId;
}, {
  inflectionTable: {
    layout: {
      rows: {
        cells: ({
          columnSpan: number;
          rowSpan: number;
          headerText: string;
        } | {
          columnSpan: number;
          rowSpan: number;
          inflectedForm: {
            inflectionPattern: string;
            deriveLemma: boolean;
            displayName: string;
            hasCustomDisplayName: boolean;
          };
        })[];
      }[];
    };
  } | null;
}>;

