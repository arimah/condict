import {IdOf, InputIdOf} from '../id-of';
import {PartOfSpeechId, PartOfSpeechInputId} from '../part-of-speech/types';

export type InflectionTableId = IdOf<'InflectionTable'>;
export type InflectionTableInputId = InputIdOf<'InflectionTable'>;
export type InflectionTableLayoutId = IdOf<'InflectionTableLayout'>;
export type InflectionTableLayoutInputId = InputIdOf<'InflectionTableLayout'>;
export type InflectedFormId = IdOf<'InflectedForm'>;
export type InflectedFormInputId = InputIdOf<'InflectedForm'>;

export interface InflectionTableRow {
  id: InflectionTableId;
  part_of_speech_id: PartOfSpeechId;
  name: string;
}

/**
 * This type is a combination of inflection_table_versions and inflection_table_layouts,
 * as queried by the InflectionTableLayout model.
 */
export interface InflectionTableLayoutRow {
  /** The layout version ID */
  id: InflectionTableLayoutId;
  inflection_table_id: InflectionTableId;
  /** Boolean */
  is_current: number;
  /** JSON-serialized data */
  layout: string;
  /** JSON-serialized data */
  stems: string;
}

export interface InflectedFormRow {
  id: InflectedFormId;
  inflection_table_version_id: InflectionTableLayoutId;
  /** Boolean */
  derive_lemma: number;
  /** Boolean */
  custom_display_name: number;
  inflection_pattern: string;
  display_name: string;
}

export interface NewInflectionTableInput {
  partOfSpeechId: PartOfSpeechInputId;
  name: string;
  layout: InflectionTableRowInput[];
}

export interface EditInflectionTableInput {
  name?: string | null;
  layout?: InflectionTableRowInput[] | null;
}

export interface InflectionTableRowInput {
  cells: InflectionTableCellInput[];
}

export interface InflectionTableCellInput {
  columnSpan?: number | null;
  rowSpan?: number | null;
  headerText?: string | null;
  inflectedForm?: InflectedFormInput | null;
}

export interface InflectedFormInput {
  id?: InflectedFormInputId | null;
  deriveLemma: boolean;
  inflectionPattern: string;
  displayName: string;
  hasCustomDisplayName: boolean;
}

export interface InflectionTableRowJson {
  cells: InflectionTableCellJson[];
}

export interface InflectionTableCellJson {
  rowSpan?: number;
  columnSpan?: number;
  headerText?: string;
  inflectedFormId?: InflectedFormId;
}

