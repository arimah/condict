/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  PartOfSpeechId
} from "../graphql";

export const AllPartsOfSpeechQuery = "query AllPartsOfSpeechQuery($lang:LanguageId!){language(id:$lang){...FormPartsOfSpeechFragment}}fragment FormPartsOfSpeechFragment on Language{partsOfSpeech{id,name}}" as Query<{
  lang: LanguageId;
}, {
  language: {
    partsOfSpeech: {
      id: PartOfSpeechId;
      name: string;
    }[];
  } | null;
}>;

