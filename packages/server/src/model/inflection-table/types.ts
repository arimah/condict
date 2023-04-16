import {
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  LanguageId,
  DefinitionId,
} from '../../graphql';

export type InflectionTableRow = {
  id: InflectionTableId;
  language_id: LanguageId;
  time_created: number;
  time_updated: number;
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

export type DefinitionUsingInflectionTableRow = {
  definition_id: DefinitionId;
  /** Boolean */
  has_old_layouts: number;
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
