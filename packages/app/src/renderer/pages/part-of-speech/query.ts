/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  PartOfSpeechId,
  LanguageId,
  InflectionTableId,
  UtcInstant,
  Mutation,
  EditPartOfSpeechInput
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

export const EditPartOfSpeechQuery = "query EditPartOfSpeechQuery($id:PartOfSpeechId!){partOfSpeech(id:$id){id,name,language{id,name}isInUse}}" as Query<{
  id: PartOfSpeechId;
}, {
  partOfSpeech: {
    id: PartOfSpeechId;
    name: string;
    language: {
      id: LanguageId;
      name: string;
    };
    isInUse: boolean;
  } | null;
}>;

export const EditPartOfSpeechMut = "mutation EditPartOfSpeechMut($id:PartOfSpeechId!,$data:EditPartOfSpeechInput!){editPartOfSpeech(id:$id,data:$data){id}}" as Mutation<{
  id: PartOfSpeechId;
  data: EditPartOfSpeechInput;
}, {
  editPartOfSpeech: {
    id: PartOfSpeechId;
  } | null;
}>;

