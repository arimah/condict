import {PartOfSpeechId, LanguageId} from '../../graphql';

export type PartOfSpeechRow = {
  id: PartOfSpeechId;
  language_id: LanguageId;
  time_created: number;
  time_updated: number;
  name: string;
};
