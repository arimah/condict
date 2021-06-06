/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  PartOfSpeechId
} from "../../graphql-shared";

export default "query($id:LanguageId!){language(id:$id){name,partsOfSpeech{id,name}}}" as Query<{
  id: LanguageId;
}, {
  language: {
    name: string;
    partsOfSpeech: {
      id: PartOfSpeechId;
      name: string;
    }[];
  } | null;
}>;

