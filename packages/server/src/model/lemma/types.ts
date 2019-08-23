import {LemmaId, LanguageId} from '../../graphql/types';

export type LemmaRow = {
  id: LemmaId;
  language_id: LanguageId;
  term_unique: string;
  term_display: string;
};
