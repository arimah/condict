import {LemmaId, LanguageId} from '../../graphql';

export type LemmaRow = {
  id: LemmaId;
  language_id: LanguageId;
  term: string;
};
