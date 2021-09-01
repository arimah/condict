import {DefinitionTableRowJson} from '@condict/table-editor';
import {BlockElement} from '@condict/rich-text-editor';

import {
  DefinitionId,
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  DefinitionInflectionTableId,
} from '../../graphql';
import {DefinitionTableValue} from '../../form-fields';

export interface DefinitionData {
  id: DefinitionId | null;
  term: string;
  partOfSpeech: PartOfSpeechId | null;
  description: BlockElement[];
  inflectionTables: DefinitionTableData[];
  stems: Stems;
  tags: string[];
}

// HACK: Have to use an object with a property to avoid issues with shallow
// cloning in react-hook-form.
export interface Stems {
  map: Map<string, string>;
}

export interface DefinitionTableData {
  readonly id: DefinitionInflectionTableId | null;
  readonly caption: BlockElement[]; // In practice, only contains one block.
  readonly table: DefinitionTableValue;
  readonly tableId: InflectionTableId;
  readonly layoutId: InflectionTableLayoutId;
  readonly upgraded: boolean;
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
  readonly target: number; // pixels
  readonly primary: boolean;
  readonly animate: boolean;
}
