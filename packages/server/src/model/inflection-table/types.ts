import {
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  PartOfSpeechId,
} from '../../graphql/types';

export type InflectionTableRow = {
  id: InflectionTableId;
  part_of_speech_id: PartOfSpeechId;
  name: string;
};

/**
 * This type is a combination of inflection_table_versions and inflection_table_layouts,
 * as queried by the InflectionTableLayout model.
 */
export type InflectionTableLayoutRow = {
  /** The layout version ID */
  id: InflectionTableLayoutId;
  inflection_table_id: InflectionTableId;
  /** Boolean */
  is_current: number;
  /** JSON-serialized data */
  layout: string;
  /** JSON-serialized data */
  stems: string;
};

export type InflectedFormRow = {
  id: InflectedFormId;
  inflection_table_version_id: InflectionTableLayoutId;
  /** Boolean */
  derive_lemma: number;
  /** Boolean */
  custom_display_name: number;
  inflection_pattern: string;
  display_name: string;
};

export type NewInflectionTableInput = {
  partOfSpeechId: PartOfSpeechId;
  name: string;
  layout: InflectionTableRowInput[];
};

export type EditInflectionTableInput = {
  name?: string | null;
  layout?: InflectionTableRowInput[] | null;
};

export type InflectionTableRowInput = {
  cells: InflectionTableCellInput[];
};

export type InflectionTableCellInput = {
  columnSpan?: number | null;
  rowSpan?: number | null;
  headerText?: string | null;
  inflectedForm?: InflectedFormInput | null;
};

export type InflectedFormInput = {
  id?: InflectedFormId | null;
  deriveLemma: boolean;
  inflectionPattern: string;
  displayName: string;
  hasCustomDisplayName: boolean;
};

export type InflectionTableRowJson = {
  cells: InflectionTableCellJson[];
};

export type InflectionTableCellJson = {
  rowSpan?: number;
  columnSpan?: number;
  headerText?: string;
  inflectedFormId?: InflectedFormId;
};

