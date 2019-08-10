import {IdOf, InputIdOf} from '../id-of';
import {LanguageId, LanguageInputId} from '../language/types';

export type PartOfSpeechId = IdOf<'PartOfSpeech'>;
export type PartOfSpeechInputId = InputIdOf<'PartOfSpeech'>;

export type PartOfSpeechRow = {
  id: PartOfSpeechId;
  language_id: LanguageId;
  name: string;
};

export type NewPartOfSpeechInput = {
  languageId: LanguageInputId;
  name: string;
};

export type EditPartOfSpeechInput = {
  name?: string | null;
};
