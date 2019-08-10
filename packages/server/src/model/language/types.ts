import {IdOf, InputIdOf} from '../id-of';

export type LanguageId = IdOf<'Language'>;

export type LanguageInputId = InputIdOf<'Language'>;

export type LanguageRow = {
  id: LanguageId;
  lemma_count: number;
  name: string;
  url_name: string;
};

export type NewLanguageInput = {
  name: string;
  urlName: string;
};

export type EditLanguageInput = {
  name?: string | null;
  urlName?: string | null;
};
