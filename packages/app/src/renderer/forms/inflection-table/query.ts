/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  PartOfSpeechId,
  InflectionTableId
} from "../../graphql";

export const CheckNameQuery = "query CheckNameQuery($pos:PartOfSpeechId!,$name:String!){partOfSpeech(id:$pos){inflectionTableByName(name:$name){id}}}" as Query<{
  pos: PartOfSpeechId;
  name: string;
}, {
  partOfSpeech: {
    inflectionTableByName: {
      id: InflectionTableId;
    } | null;
  } | null;
}>;

