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

export type LanguageStatsRow = {
  id: LanguageId;
  lemma_count: number;
  definition_count: number;
  part_of_speech_count: number;
  tag_count: number;
};
