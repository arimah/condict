import {DefinitionTable, DefinitionTableRowJson} from '@condict/table-editor';
import {BlockElement} from '@condict/rich-text-editor';

import {
  DefinitionId,
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  DefinitionInflectionTableId,
} from '../../graphql';

export interface DefinitionData {
  id: DefinitionId | null;
  term: string;
  partOfSpeech: PartOfSpeechId | null;
  description: BlockElement[];
  inflectionTables: DefinitionTableData[];
  stems: Map<string, string>;
  tags: string[];
}

/**
 * Internal form state. This is separate from DefinitionData to keep the public
 * interface cleaner and less difficult to work with.
 *
 * This only differs from DefinitionData in that tables have (generated) keys
 * for React.
 */
export interface DefinitionFormState {
  id: DefinitionId | null;
  term: string;
  partOfSpeech: PartOfSpeechId | null;
  description: BlockElement[];
  inflectionTables: DefinitionTableFormData[];
  stems: Map<string, string>;
  tags: string[];
}

export interface DefinitionTableData {
  readonly id: DefinitionInflectionTableId | null;
  readonly caption: BlockElement[]; // In practice, only contains one block.
  readonly table: DefinitionTable;
  readonly tableId: InflectionTableId;
  readonly layoutId: InflectionTableLayoutId;
  readonly stems: readonly string[];
  readonly upgraded: boolean;
}

export interface DefinitionTableFormData extends DefinitionTableData {
  readonly key: string;
}

export interface PartOfSpeechFields {
  readonly id: PartOfSpeechId;
  readonly name: string;
  readonly inflectionTables: readonly InflectionTableFields[];
}

export interface InflectionTableFields {
  readonly id: InflectionTableId;
  readonly name: string;
  readonly layout: InflectionTableLayoutFields;
}

export interface InflectionTableLayoutFields {
  readonly id: InflectionTableLayoutId;
  readonly stems: readonly string[];
  readonly rows: DefinitionTableRowJson[];
}

export interface InflectionTableInfo {
  readonly parent: PartOfSpeechId;
  readonly table: InflectionTableFields;
}

export type InflectionTableMap = Map<InflectionTableId, InflectionTableInfo>;

// Used when moving
export interface MovingState {
  readonly offset: number; // pixels
  readonly primary: boolean;
  readonly animate: boolean;
}
