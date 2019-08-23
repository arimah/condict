import {PartOfSpeechId, LanguageId} from '../../graphql/types';

export type PartOfSpeechRow = {
  id: PartOfSpeechId;
  language_id: LanguageId;
  name: string;
};
