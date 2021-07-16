import {
  LanguageId,
  DefinitionId,
  PartOfSpeechId,
  InflectionTableId,
} from '../../graphql';

import {LanguageRow} from '../language';
import {DefinitionRow} from '../definition';
import {PartOfSpeechRow} from '../part-of-speech';
import {InflectionTableRow} from '../inflection-table';

export type RawRecentItemRow =
  | RawRecentLanguageRow
  | RawRecentDefinitionRow
  | RawRecentPartOfSpeechRow
  | RawRecentInflectionTableRow;

export interface RawRecentLanguageRow {
  type: 'language';
  id: LanguageId;
}
export interface RawRecentDefinitionRow {
  type: 'definition';
  id: DefinitionId;
}
export interface RawRecentPartOfSpeechRow {
  type: 'part-of-speech';
  id: PartOfSpeechId;
}
export interface RawRecentInflectionTableRow {
  type: 'inflection-table';
  id: InflectionTableId;
}

export type RecentItemRow =
  | RecentLanguageRow
  | RecentDefinitionRow
  | RecentPartOfSpeechRow
  | RecentInflectionTableRow;

export interface RecentLanguageRow extends LanguageRow {
  type: 'language';
}

export interface RecentDefinitionRow extends DefinitionRow {
  type: 'definition';
}

export interface RecentPartOfSpeechRow extends PartOfSpeechRow {
  type: 'part-of-speech';
}

export interface RecentInflectionTableRow extends InflectionTableRow {
  type: 'inflection-table';
}
