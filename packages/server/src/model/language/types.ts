import {LanguageId} from '../../graphql';

import {DescriptionId} from '../description';

export type LanguageRow = {
  id: LanguageId;
  lemma_count: number;
  description_id: DescriptionId;
  time_created: number;
  time_updated: number;
  name: string;
};
