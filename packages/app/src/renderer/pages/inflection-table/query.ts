/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  InflectionTableId,
  PartOfSpeechId,
  LanguageId
} from "../../graphql";

export default "query($id:InflectionTableId!){inflectionTable(id:$id){name,partOfSpeech{id,name,language{id,name}}layout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{inflectionPattern,displayName}}...on InflectionTableHeaderCell{headerText}}}}}}" as Query<{
  id: InflectionTableId;
}, {
  inflectionTable: {
    name: string;
    partOfSpeech: {
      id: PartOfSpeechId;
      name: string;
      language: {
        id: LanguageId;
        name: string;
      };
    };
    layout: {
      rows: {
        cells: ({
          rowSpan: number;
          columnSpan: number;
          inflectedForm: {
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
  } | null;
}>;

