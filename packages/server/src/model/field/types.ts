import {
  FieldId,
  FieldValueId,
  FieldValueType,
  LanguageId,
} from '../../graphql';

export const enum RawFieldType {
  BOOLEAN = 0,
  LIST_ONE = 1,
  LIST_MANY = 2,
  PLAIN_TEXT = 3,
}

export const rawFieldTypeToGql = (t: RawFieldType): FieldValueType => {
  switch (t) {
    case RawFieldType.BOOLEAN:
      return 'FIELD_BOOLEAN';
    case RawFieldType.LIST_ONE:
      return 'FIELD_LIST_ONE';
    case RawFieldType.LIST_MANY:
      return 'FIELD_LIST_MANY';
    case RawFieldType.PLAIN_TEXT:
      return 'FIELD_PLAIN_TEXT';
  }
};

export const gqlFieldTypeToRaw = (t: FieldValueType): RawFieldType => {
  switch (t) {
    case 'FIELD_BOOLEAN':
      return RawFieldType.BOOLEAN;
    case 'FIELD_LIST_ONE':
      return RawFieldType.LIST_ONE;
    case 'FIELD_LIST_MANY':
      return RawFieldType.LIST_MANY;
    case 'FIELD_PLAIN_TEXT':
      return RawFieldType.PLAIN_TEXT;
  }
};

export type FieldRow = {
  id: FieldId;
  language_id: LanguageId;
  value_type: number;
  /** Boolean */
  has_pos_filter: number;
  name: string;
  name_abbr: string;
};

export type FieldValueRow = {
  id: FieldValueId;
  field_id: FieldId;
  value: string;
  value_abbr: string;
};
