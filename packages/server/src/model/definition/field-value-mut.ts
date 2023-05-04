import {DataReader, DataWriter} from '../../database';
import {UserInputError} from '../../errors';
import {
  DefinitionId,
  DefinitionFieldInput,
  PartOfSpeechId,
  LanguageId,
  FieldId,
  FieldValueId,
} from '../../graphql';

import {RawFieldType} from '../field';

type FieldDataRow = {
  id: FieldId;
  language_id: LanguageId;
  value_type: number;
  /** Boolean */
  is_right_pos: number;
};

type FieldValueDataRow = {
  id: FieldValueId;
  field_id: FieldId;
};

const DefinitionFieldValueMut = {
  insertAll(
    db: DataWriter,
    definitionId: DefinitionId,
    partOfSpeechId: PartOfSpeechId,
    languageId: LanguageId,
    fields: DefinitionFieldInput[]
  ): FieldId[] {
    // We may not end up inserting values for every field specified – for
    // instance, a list field with no values selected is not stored, nor
    // are boolean fields with the value false – but we still have to resolve
    // every field in the input. We must verify that:
    //
    //   1. There are no duplicate fields;
    //   2. Every field ID actually exists;
    //   3. Every field belongs to the right language;
    //   4. Each field can be used in the definition's part of speech;
    //   5. The value supplied for each field is of the right type; and
    //   6. Every field value ID actually exists *and* belongs to the right
    //      field.

    if (fields.length === 0) {
      // No fields, nothing to do.
      return [];
    }

    // First, let's collect field and value IDs.
    const fieldMap = new Map<FieldId, DefinitionFieldInput>();
    const selectedValues: FieldValueId[] = [];
    for (const field of fields) {
      if (fieldMap.has(field.fieldId)) {
        throw new UserInputError(`Duplicate value for field ${field.fieldId}`);
      }

      fieldMap.set(field.fieldId, field);

      if (field.listValues) {
        selectedValues.push(...field.listValues);
      }
    }

    // Now we can fetch data about each of the fields.
    const fieldData = fetchFieldData(db, fieldMap, partOfSpeechId);

    // Let's also fetch a mapping from value ID to the parent field ID, which
    // we use later to verify (i) that each value exists, (ii) that it belongs
    // to the intended field.
    const valueParents = fetchValueParents(db, selectedValues);

    // Now check the language, POS, value type, and all list values.
    // Here we also collect field values that will be inserted later.
    const {trueValues, listValues, textValues} = collectFieldValues(
      fieldMap,
      fieldData,
      valueParents,
      partOfSpeechId,
      languageId
    );

    if (trueValues.length > 0) {
      db.exec`
        insert into definition_field_true_values (definition_id, field_id)
        values ${trueValues.map(fieldId =>
          db.raw`(${definitionId}, ${fieldId})`
        )}
      `;
    }
    if (listValues.length > 0) {
      db.exec`
        insert into definition_field_list_values (
          definition_id,
          field_value_id,
          field_id
        )
        values ${listValues.map(([fieldId, valueId]) =>
          db.raw`(${definitionId}, ${valueId}, ${fieldId})`
        )}
      `;
    }
    if (textValues.length > 0) {
      db.exec`
        insert into definition_field_text_values (
          definition_id,
          field_id,
          value
        )
        values ${textValues.map(([fieldId, value]) =>
          db.raw`(${definitionId}, ${fieldId}, ${value})`
        )}
      `;
    }

    return Array.from(fieldData, row => row.id);
  },

  update(
    db: DataWriter,
    definitionId: DefinitionId,
    partOfSpeechId: PartOfSpeechId,
    languageId: LanguageId,
    fields: DefinitionFieldInput[]
  ): [prev: FieldId[], next: FieldId[]] {
    // We could compute a delta here, but it's kind of messy and complex, and
    // this all happens inside a transaction anyway. There are no references
    // to any of the definition field value tables.
    const prevFieldIds = this.deleteAll(db, definitionId);
    const nextFieldIds = this.insertAll(
      db,
      definitionId,
      partOfSpeechId,
      languageId,
      fields
    );
    return [prevFieldIds, nextFieldIds];
  },

  deleteAll(db: DataWriter, definitionId: DefinitionId): FieldId[] {
    type Row = { field_id: FieldId };

    const boolIds = db.all<Row>`
      delete from definition_field_true_values
      where definition_id = ${definitionId}
      returning field_id
    `;

    // To deduplicate field_id for list values, we use a select with
    // a group by.
    const listIds = db.all<Row>`
      select dflv.field_id
      from definition_field_list_values dflv
      where dflv.definition_id = ${definitionId}
      group by dflv.field_id
    `;

    db.exec`
      delete from definition_field_list_values
      where definition_id = ${definitionId}
    `;

    const textIds = db.all<Row>`
      delete from definition_field_text_values
      where definition_id = ${definitionId}
      returning field_id
    `;

    return [
      ...boolIds,
      ...listIds,
      ...textIds,
    ].map(row => row.field_id);
  },
} as const;

const fetchFieldData = (
  db: DataReader,
  inputFields: Map<FieldId, DefinitionFieldInput>,
  partOfSpeechId: PartOfSpeechId
): FieldDataRow[] => {
  const result = db.all<FieldDataRow>`
    select
      f.id,
      f.language_id,
      f.value_type,
      f.has_pos_filter = 0 or fpos.field_id is not null as is_right_pos
    from fields f
    left join field_parts_of_speech fpos on
      fpos.field_id = f.id and
      fpos.part_of_speech_id = ${partOfSpeechId}
    where f.id in (${Array.from(inputFields.keys())})
    group by f.id
  `;
  if (result.length < inputFields.size) {
    // If the number of fetched fields is less than what the user specified,
    // at least one field must be missing.
    reportUnresolvedFields(inputFields, result);
  }
  return result;
};

const fetchValueParents = (
  db: DataReader,
  selectedValues: FieldValueId[]
): Map<FieldValueId, FieldId> => {
  const result = new Map<FieldValueId, FieldId>();

  if (selectedValues.length > 0) {
    const valueData = db.all<FieldValueDataRow>`
      select
        id,
        field_id
      from field_values
      where id in (${selectedValues})
    `;
    for (const row of valueData) {
      result.set(row.id, row.field_id);
    }
  }

  return result;
};

interface CollectedFieldValues {
  trueValues: FieldId[];
  listValues: [FieldId, FieldValueId][];
  textValues: [FieldId, string][];
}

const collectFieldValues = (
  inputFields: Map<FieldId, DefinitionFieldInput>,
  fieldData: FieldDataRow[],
  valueParents: Map<FieldValueId, FieldId>,
  partOfSpeechId: PartOfSpeechId,
  languageId: LanguageId
): CollectedFieldValues => {
  // Now check the language, POS, value type, and all list values.
  // Here we also collect field values that will be inserted later.
  const trueValues: FieldId[] = [];
  const listValues: [FieldId, FieldValueId][] = [];
  const textValues: [FieldId, string][] = [];
  for (const field of fieldData) {
    if (field.language_id !== languageId) {
      throw new UserInputError(
        `Field ${field.id} belongs to the wrong language`
      );
    }
    if (!field.is_right_pos) {
      throw new UserInputError(
        `Field ${field.id} cannot be used in part of speech ${partOfSpeechId}`
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const input = inputFields.get(field.id)!;
    switch (field.value_type) {
      case RawFieldType.BOOLEAN:
        collectBooleanValue(input, field, trueValues);
        break;
      case RawFieldType.LIST_ONE:
      case RawFieldType.LIST_MANY:
        collectListValues(input, field, valueParents, listValues);
        break;
      case RawFieldType.PLAIN_TEXT:
        collectTextValue(input, field, textValues);
    }
  }

  return {trueValues, listValues, textValues};
};

const collectBooleanValue = (
  input: DefinitionFieldInput,
  field: FieldDataRow,
  trueValues: FieldId[]
): void => {
  if (input.booleanValue == null) {
    throw new UserInputError(`Field ${field.id} requires a \`booleanValue\``);
  }
  if (input.listValues != null || input.textValue != null) {
    throw new UserInputError(
      `Field ${field.id} only accepts a \`booleanValue\``
    );
  }

  if (input.booleanValue) {
    trueValues.push(field.id);
  }
};

const collectListValues = (
  input: DefinitionFieldInput,
  field: FieldDataRow,
  valueParents: Map<FieldValueId, FieldId>,
  listValues: [FieldId, FieldValueId][]
): void => {
  if (input.listValues == null) {
    throw new UserInputError(`Field ${field.id} requires \`listValues\``);
  }
  if (input.booleanValue != null || input.textValue != null) {
    throw new UserInputError(`Field ${field.id} only accepts \`listValues\``);
  }

  if (
    field.value_type === RawFieldType.LIST_ONE &&
    input.listValues.length > 1
  ) {
    throw new UserInputError(
      `Field ${field.id} does not accept multiple values`
    );
  }

  for (const valueId of input.listValues) {
    const parent = valueParents.get(valueId);
    if (parent == null) {
      throw new UserInputError(`Field value not found: ${valueId}`);
    }
    if (parent !== field.id) {
      throw new UserInputError(
        `Field value ${valueId} does not belong to field ${field.id}`
      );
    }
    listValues.push([parent, valueId]);
  }
};

const collectTextValue = (
  input: DefinitionFieldInput,
  field: FieldDataRow,
  textValues: [FieldId, string][]
): void => {
  if (input.textValue == null) {
    throw new UserInputError(`Field ${field.id} requires a \`textValue\``);
  }
  if (input.booleanValue != null || input.listValues != null) {
    throw new UserInputError(`Field ${field.id} only accepts a \`textValue\``);
  }
  textValues.push([field.id, input.textValue]);
};

const reportUnresolvedFields = (
  inputFields: Map<FieldId, DefinitionFieldInput>,
  fieldData: FieldDataRow[]
): void => {
  // The complexity of this is O(n*m), but n and m are basically guaranteed
  // to be tiny.
  for (const fieldId of inputFields.keys()) {
    if (!fieldData.some(r => r.id === fieldId)) {
      throw new UserInputError(`Field not found: ${fieldId}`);
    }
  }
};

export default DefinitionFieldValueMut;
