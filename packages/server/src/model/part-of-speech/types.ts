import {PartOfSpeechId, LanguageId} from '../../graphql';

import {DescriptionId} from '../description';

export type PartOfSpeechRow = {
  id: PartOfSpeechId;
  language_id: LanguageId;
  description_id: DescriptionId;
  time_created: number;
  time_updated: number;
  name: string;
};

export type PartOfSpeechStatsRow = {
  id: PartOfSpeechId;
  inflection_table_count: number;
  definition_count: number;
};
