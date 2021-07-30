/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId
} from "../../graphql";

export const CheckNameQuery = "query CheckNameQuery($name:String!){languageByName(name:$name){id}}" as Query<{
  name: string;
}, {
  languageByName: {
    id: LanguageId;
  } | null;
}>;

