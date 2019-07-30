import {IdOf, InputIdOf} from '../id-of';
import {LanguageId} from '../language/types';

export type LemmaId = IdOf<'Lemma'>;
export type LemmaInputId = InputIdOf<'Lemma'>;

export interface LemmaRow {
  id: LemmaId;
  language_id: LanguageId;
  term_unique: string;
  term_display: string;
}

export const enum LemmaFilter {
  ALL_LEMMAS = 'ALL_LEMMAS',
  DEFINED_LEMMAS_ONLY = 'DEFINED_LEMMAS_ONLY',
  DERIVED_LEMMAS_ONLY = 'DERIVED_LEMMAS_ONLY',
}
