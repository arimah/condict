import {IdOf, InputIdOf} from '../id-of';
import {LanguageId, LanguageInputId} from '../language/types';

export type PartOfSpeechId = IdOf<'PartOfSpeech'>;
export type PartOfSpeechInputId = InputIdOf<'PartOfSpeech'>;

export interface PartOfSpeechRow {
  id: PartOfSpeechId;
  language_id: LanguageId;
  name: string;
}

export interface NewPartOfSpeechInput {
  languageId: LanguageInputId;
  name: string;
}

export interface EditPartOfSpeechInput {
  name?: string | null;
}
