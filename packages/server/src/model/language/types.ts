import {LanguageId} from '../../graphql';

export type LanguageRow = {
  id: LanguageId;
  lemma_count: number;
  name: string;
};

export type LanguageDescriptionRow = {
  language_id: LanguageId;
  /** JSON-serialized data */
  description: string;
};
