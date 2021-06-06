/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  PartOfSpeechId
} from "../../graphql-shared";

export default "query{languages{id,name,partsOfSpeech{id,name}}}" as Query<{} | null | undefined, {
  languages: {
    id: LanguageId;
    name: string;
    partsOfSpeech: {
      id: PartOfSpeechId;
      name: string;
    }[];
  }[];
}>;

