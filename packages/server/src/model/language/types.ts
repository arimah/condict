import {LanguageId} from '../../graphql/types';

export type LanguageRow = {
  id: LanguageId;
  lemma_count: number;
  name: string;
  url_name: string;
};
