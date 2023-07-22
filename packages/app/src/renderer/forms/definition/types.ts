import {DefinitionTable, DefinitionTableRowJson} from '@condict/table-editor';
import {BlockElement} from '@condict/rich-text-editor';

import {
  DefinitionId,
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  DefinitionInflectionTableId,
  FieldId,
  FieldValueId,
  FieldValueType,
} from '../../graphql';
import {TagValue} from '../../form-fields';

export interface DefinitionData {
  id: DefinitionId | null;
  term: string;
  partOfSpeech: PartOfSpeechId | null;
  description: BlockElement[];
  inflectionTables: DefinitionTableData[];
  stems: Map<string, string>;
  tags: TagValue[];
  fields: DefinitionFieldData[];
}

export type DefinitionFieldData =
  | DefinitionFieldBooleanData
  | DefinitionFieldListData
  | DefinitionFieldPlainTextData;

export interface DefinitionFieldBooleanData {
  type: 'boolean';
  fieldId: FieldId;
  value: boolean;
}

export interface DefinitionFieldListData {
  type: 'list';
  fieldId: FieldId;
  value: FieldValueId[];
}

export interface DefinitionFieldPlainTextData {
  type: 'plainText';
  fieldId: FieldId;
  value: string;
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
  tags: TagValue[];
  fields: Readonly<Record<FieldId, DefinitionFieldValue>>;
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

export interface DefinitionFieldValue {
  readonly boolean: boolean;
  readonly list: FieldValueId[];
  readonly plainText: string;
}

export const EmptyFieldValue: DefinitionFieldValue = {
  boolean: false,
  list: [],
  plainText: '',
};

export interface FieldData {
  readonly id: FieldId;
  readonly name: string;
  readonly nameAbbr: string;
  readonly valueType: FieldValueType;
  readonly partsOfSpeech: readonly {
    readonly id: PartOfSpeechId;
  }[] | null;
  readonly listValues: readonly FieldValueData[] | null;
}

export const isFieldSelectable = (
  field: FieldData,
  partOfSpeech: PartOfSpeechId | null
): boolean => {
  if (field.partsOfSpeech == null) {
    // Field can be used in any part of speech
    return true;
  }

  if (partOfSpeech === null) {
    // We need a part of speech but don't have one
    return false;
  }

  for (let i = 0; i < field.partsOfSpeech.length; i++) {
    if (field.partsOfSpeech[i].id === partOfSpeech) {
      return true;
    }
  }
  return false;
};

export interface FieldValueData {
  readonly id: FieldValueId;
  readonly value: string;
  readonly valueAbbr: string;
}

export interface InflectionTableData {
  readonly id: InflectionTableId;
  readonly name: string;
  readonly layout: InflectionTableLayoutFields;
}

export interface InflectionTableLayoutFields {
  readonly id: InflectionTableLayoutId;
  readonly stems: readonly string[];
  readonly rows: DefinitionTableRowJson[];
}

export type InflectionTableMap = Map<InflectionTableId, InflectionTableData>;

// Used when moving inflection tables
export interface MovingState {
  readonly offset: number; // pixels
  readonly primary: boolean;
  readonly animate: boolean;
}
