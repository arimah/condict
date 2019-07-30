import {IdOf, InputIdOf} from '../id-of';

export type LanguageId = IdOf<'Language'>;

export type LanguageInputId = InputIdOf<'Language'>;

export interface LanguageRow {
  id: LanguageId;
  lemma_count: number;
  name: string;
  url_name: string;
}

export interface NewLanguageInput {
  name: string;
  urlName: string;
}

export interface EditLanguageInput {
  name?: string | null;
  urlName?: string | null;
}
