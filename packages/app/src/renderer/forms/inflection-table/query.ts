/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  InflectionTableId
} from "../../graphql";

export const CheckNameQuery = "query CheckNameQuery($lang:LanguageId!,$name:String!){language(id:$lang){inflectionTableByName(name:$name){id}}}" as Query<{
  lang: LanguageId;
  name: string;
}, {
  language: {
    inflectionTableByName: {
      id: InflectionTableId;
    } | null;
  } | null;
}>;

