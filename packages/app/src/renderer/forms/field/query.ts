/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  FieldId,
  Mutation
} from "../../graphql";

export const CheckNameQuery = "query CheckNameQuery($lang:LanguageId!,$name:String!){language(id:$lang){fieldByName(name:$name){id}}}" as Query<{
  lang: LanguageId;
  name: string;
}, {
  language: {
    fieldByName: {
      id: FieldId;
    } | null;
  } | null;
}>;

export const ValidateValuesMut = "mutation ValidateValuesMut($values:[String!]!){validateFieldValues(values:$values){valid,invalid,duplicates{indices}}}" as Mutation<{
  values: string[];
}, {
  validateFieldValues: {
    valid: boolean;
    invalid: number[] | null;
    duplicates: {
      indices: number[];
    }[] | null;
  };
}>;

