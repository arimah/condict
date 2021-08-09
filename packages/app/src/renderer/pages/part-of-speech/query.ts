/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  PartOfSpeechId,
  LanguageId,
  InflectionTableId,
  UtcInstant
} from "../../graphql";

export default "query($id:PartOfSpeechId!){partOfSpeech(id:$id){name,language{id,name}inflectionTables{id,name,timeCreated,timeUpdated,usedByDefinitions{page{totalCount}}}}}" as Query<{
  id: PartOfSpeechId;
}, {
  partOfSpeech: {
    name: string;
    language: {
      id: LanguageId;
      name: string;
    };
    inflectionTables: {
      id: InflectionTableId;
      name: string;
      timeCreated: UtcInstant;
      timeUpdated: UtcInstant;
      usedByDefinitions: {
        page: {
          totalCount: number;
        };
      };
    }[];
  } | null;
}>;

