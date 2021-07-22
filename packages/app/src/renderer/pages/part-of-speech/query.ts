/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  PartOfSpeechId,
  LanguageId
} from "../../graphql";

export default "query($id:PartOfSpeechId!){partOfSpeech(id:$id){name,language{id,name,partsOfSpeech{id,name}}}}" as Query<{
  id: PartOfSpeechId;
}, {
  partOfSpeech: {
    name: string;
    language: {
      id: LanguageId;
      name: string;
      partsOfSpeech: {
        id: PartOfSpeechId;
        name: string;
      }[];
    };
  } | null;
}>;

