import {LanguageId} from '../../graphql';

import {DescriptionId} from '../description';

export type LanguageRow = {
  id: LanguageId;
  lemma_count: number;
  description_id: DescriptionId;
  name: string;
};
