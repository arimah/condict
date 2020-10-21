import {LanguageId} from '../../graphql';

export type LanguageRow = {
  id: LanguageId;
  lemma_count: number;
  name: string;
};
