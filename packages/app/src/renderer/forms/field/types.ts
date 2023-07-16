import {FieldId, FieldValueId, FieldValueType, PartOfSpeechId} from '../../graphql';

export interface FieldData {
  id: FieldId | null;
  name: string;
  nameAbbr: string;
  partOfSpeechIds: PartOfSpeechId[] | null;
  valueType: FieldValueType;
  listValues: FieldValueData[] | null;
}

/**
 * Internal form state. This is separate from FieldData to keep the public
 * interface cleaner and less difficult to work with.
 *
 * This only differs from FieldData in two ways:
 *
 *   1. List values have (generated) keys for React.
 *   2. The field's value type is represented a little bit strangely. In the
 *      GraphQL schema, we have separate FieldValueTypes for single-select and
 *      multi-select lists. In the form data, we fold these into the same list
 *      type and instead have a checkbox for toggling between single and
 *      multiple selection, as that seems to result in a more straightforward
 *      UI. This also allows us to remember a field's most recently chosen list
 *      selection type.
 *
 *      When the form is saved, we reconstruct the appropriate FieldValueType.
 */
export interface FieldFormState {
  id: FieldId | null;
  name: string;
  nameAbbr: string;
  partsOfSpeech: PartOfSpeechId[];
  /**
   * If this is true, GraphQL returned an empty list of parts of speech for an
   * existing field, which means all the parts of speech that were previously
   * selected have been deleted, rendering the field unselectable. Saving such
   * a field will make it available in every part of speech, as it is not
   * possible to directly create an unselectable field.
   *
   * Note: When GraphQL returns null instead of the empty list, it means the
   * field didn't have a filter to begin with.
   */
  wasEmptyPosSelection: boolean;
  valueType: FormValueType;
  multiSelectList: boolean;
  listValues: FieldValueFormData[];
}

export type FormValueType = 'boolean' | 'list' | 'plainText';

export interface FieldValueData {
  readonly id: FieldValueId | null;
  readonly value: string;
  readonly valueAbbr: string;
}

export interface FieldValueFormData extends FieldValueData {
  readonly key: string;
}

export const getFormValueType = (valueType: FieldValueType): FormValueType => {
  switch (valueType) {
    case 'FIELD_BOOLEAN':
      return 'boolean';
    case 'FIELD_LIST_ONE':
    case 'FIELD_LIST_MANY':
      return 'list';
    case 'FIELD_PLAIN_TEXT':
      return 'plainText';
  }
};

export const getGqlValueType = (data: FieldFormState): FieldValueType => {
  switch (data.valueType) {
    case 'boolean':
      return 'FIELD_BOOLEAN';
    case 'list':
      return data.multiSelectList ? 'FIELD_LIST_MANY' : 'FIELD_LIST_ONE';
    case 'plainText':
      return 'FIELD_PLAIN_TEXT';
  }
};
