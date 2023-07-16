/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId
} from "../../graphql";

export const AllInflectionTablesQuery = "query AllInflectionTablesQuery($lang:LanguageId!){language(id:$lang){...DefinitionFormInflectionTablesFragment}}fragment DefinitionFormInflectionTablesFragment on Language{inflectionTables{id,name,layout{id,stems...DefinitionTableFragment}}}fragment DefinitionTableFragment on InflectionTableLayout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{id,inflectionPattern,displayName}}...on InflectionTableHeaderCell{headerText}}}}" as Query<{
  lang: LanguageId;
}, {
  language: {
    inflectionTables: {
      id: InflectionTableId;
      name: string;
      layout: {
        id: InflectionTableLayoutId;
        stems: string[];
        rows: {
          cells: ({
            rowSpan: number;
            columnSpan: number;
            inflectedForm: {
              id: InflectedFormId;
              inflectionPattern: string;
              displayName: string;
            };
          } | {
            rowSpan: number;
            columnSpan: number;
            headerText: string;
          })[];
        }[];
      };
    }[];
  } | null;
}>;

