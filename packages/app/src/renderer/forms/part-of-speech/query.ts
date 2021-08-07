/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  PartOfSpeechId
} from "../../graphql";

export const CheckNameQuery = "query CheckNameQuery($lang:LanguageId!,$name:String!){language(id:$lang){partOfSpeechByName(name:$name){id}}}" as Query<{
  lang: LanguageId;
  name: string;
}, {
  language: {
    partOfSpeechByName: {
      id: PartOfSpeechId;
    } | null;
  } | null;
}>;

