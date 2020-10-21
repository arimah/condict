import {PartOfSpeechId, LanguageId} from '../../graphql';

export type PartOfSpeechRow = {
  id: PartOfSpeechId;
  language_id: LanguageId;
  name: string;
};
