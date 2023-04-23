import {FieldId, FieldValueId, LanguageId} from '../../graphql';

export const enum RawFieldType {
  BOOLEAN = 0,
  LIST_ONE = 1,
  LIST_MANY = 2,
  PLAIN_TEXT = 3,
}

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
