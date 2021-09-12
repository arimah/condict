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
  stems: Map<string, string>;
  tags: string[];
}

/**
 * Internal form state. This is separate from DefinitionData to keep the public
 * interface cleaner and less difficult to work with. This type has a few design
 * decisions that are caused entirely by react-hook-form's quirky behaviour.
 */
export interface DefinitionFormState {
  id: DefinitionId | null;
  term: string;
  partOfSpeech: PartOfSpeechId | null;
  description: BlockElement[];
  inflectionTables: DefinitionTables;
  stems: Stems;
  tags: string[];
}

export interface DefinitionTables {
  /**
   * IDs of current tables, kept in their display order. This value is owned
   * and managed by `useFieldArray()`.
   */
  list: DefinitionTableId[];
  /**
   * The actual table data, indexed by table key. Kept separate from the list
   * of tables exlusively to prevent default value pollution. If we put this
   * data inside `list`, when the user goes to *edit* an existing definition,
   * if they remove a table and add another in its place, then the new table
   * will use the values that are already in the form's `defaultValues` - i.e.
   * the initial state of the removed table. It's weird.
   *
   * These fields are set up to unregister on unmount, ensuring we clean up
   * after removing tables.
   */
  data: Record<string, DefinitionTableData>;
}

export interface DefinitionTableId {
  id: string;
}

export interface DefinitionTableData {
  readonly id: DefinitionInflectionTableId | null;
  readonly caption: BlockElement[]; // In practice, only contains one block.
  readonly table: DefinitionTableValue;
  readonly tableId: InflectionTableId;
  readonly layoutId: InflectionTableLayoutId;
  readonly upgraded: boolean;
}

// HACK: Have to use an object with a property to avoid issues with shallow
// cloning in react-hook-form.
export interface Stems {
  map: Map<string, string>;
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
