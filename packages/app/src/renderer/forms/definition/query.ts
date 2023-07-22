/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  FieldId,
  FieldValueType,
  PartOfSpeechId,
  FieldValueId
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

export const AllFieldsQuery = "query AllFieldsQuery($lang:LanguageId!){language(id:$lang){...DefinitionFormFieldsFragment}}fragment DefinitionFormFieldsFragment on Language{fields{id,name,nameAbbr,valueType,partsOfSpeech{id}listValues{id,value,valueAbbr}}}" as Query<{
  lang: LanguageId;
}, {
  language: {
    fields: {
      id: FieldId;
      name: string;
      nameAbbr: string;
      valueType: FieldValueType;
      partsOfSpeech: {
        id: PartOfSpeechId;
      }[] | null;
      listValues: {
        id: FieldValueId;
        value: string;
        valueAbbr: string;
      }[] | null;
    }[];
  } | null;
}>;

