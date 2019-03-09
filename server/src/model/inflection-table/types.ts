export interface InflectionTableRow {
  id: number;
  part_of_speech_id: number;
  name: string;
}

export interface InflectedFormRow {
  id: number;
  inflection_table_id: number;
  /** Boolean */
  derive_lemma: number;
  /** Boolean */
  custom_display_name: number;
  inflection_pattern: string;
  display_name: string;
}

export interface InflectionTableLayoutRow {
  inflection_table_id: number;
  /** JSON-serialized data */
  layout: string;
  /** JSON-serialized data */
  stems: string;
}

export interface NewInflectionTableInput {
  partOfSpeechId: string;
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
  id?: string | null;
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
  inflectedFormId?: number;
}

