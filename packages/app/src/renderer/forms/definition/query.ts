/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId
} from "../../graphql";

export const AllPartsOfSpeechQuery = "query AllPartsOfSpeechQuery($lang:LanguageId!){language(id:$lang){...DefinitionFormPartsOfSpeechFragment}}fragment DefinitionFormPartsOfSpeechFragment on Language{partsOfSpeech{id,name,inflectionTables{id,name,layout{id,stems...DefinitionTableFragment}}}}fragment DefinitionTableFragment on InflectionTableLayout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{id,inflectionPattern}}...on InflectionTableHeaderCell{headerText}}}}" as Query<{
  lang: LanguageId;
}, {
  language: {
    partsOfSpeech: {
      id: PartOfSpeechId;
      name: string;
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
              };
            } | {
              rowSpan: number;
              columnSpan: number;
              headerText: string;
            })[];
          }[];
        };
      }[];
    }[];
  } | null;
}>;

