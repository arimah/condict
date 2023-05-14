import {nanoid} from 'nanoid';

import {DataReader, DataWriter} from '../../database';
import {UserInputError} from '../../errors';
import {
  FieldId,
  NewFieldInput,
  EditFieldInput,
  FieldValueInput,
  FieldValueId,
  FieldValueType,
  NewFieldValueInput,
  EditFieldValueInput,
  PartOfSpeechId,
} from '../../graphql';

import {Field, FieldValue} from '../field';
import {Language} from '../language';
import {PartOfSpeech, PartOfSpeechRow} from '../part-of-speech';
import {Definition} from '../definition';
import FieldSet from '../field-set';
import {MutContext} from '../types';

import {
  FieldRow,
  FieldValueRow,
  RawFieldType,
  gqlFieldTypeToRaw,
  rawFieldTypeToGql,
} from './types';
import validateValues from './validate-values';
import {validateName, validateSingleValue} from './validators';

interface FieldValuePatches {
  deleted: FieldValueId[] | 'all';
  updated: FieldValueInput[];
  added: FieldValueInput[];
}

const FieldMut = {
  insert(context: MutContext, data: NewFieldInput): Promise<FieldRow> {
    return MutContext.transact(context, async context => {
      const {db, events, logger} = context;

      const language = await Language.byIdRequired(
        context.db,
        data.languageId,
        'languageId'
      );

      const partsOfSpeech = await this.resolvePartsOfSpeech(
        db,
        data.partOfSpeechIds
      );

      const name = validateName(db, null, language.id, data.name);
      const nameAbbr = data.nameAbbr.trim();

      const valueType = gqlFieldTypeToRaw(data.valueType);

      let values: FieldValueInput[];
      if (isListType(valueType)) {
        if (data.listValues == null) {
          throw new UserInputError('A list-type field must have `listValues`', {
            invalidArgs: ['listValues'],
          });
        }
        values = validateValues(db, data.listValues);
      } else {
        if (data.listValues != null) {
          throw new UserInputError('A non-list field cannot have `listValues`', {
            invalidArgs: ['listValues'],
          });
        }
        values = [];
      }

      const {insertId: fieldId} = db.exec<FieldId>`
        insert into fields (
          language_id,
          value_type,
          has_pos_filter,
          name,
          name_abbr
        )
        values (
          ${language.id},
          ${valueType},
          ${partsOfSpeech.length > 0},
          ${name},
          ${nameAbbr}
        )
      `;

      this.insertPartsOfSpeech(db, fieldId, partsOfSpeech);

      FieldValueMut.insertAll(db, fieldId, values);

      events.emit({
        type: 'field',
        action: 'update',
        id: fieldId,
        languageId: language.id,
      });
      logger.verbose(`Created field: ${fieldId}`);

      return Field.byIdRequired(db, fieldId);
    });
  },

  update(
    context: MutContext,
    id: FieldId,
    data: EditFieldInput
  ): Promise<FieldRow> {
    return MutContext.transact(context, async context => {
      const {db, events, logger} = context;

      const field = await Field.byIdRequired(db, id);

      const newFields = new FieldSet<FieldRow>();

      let partsOfSpeech: PartOfSpeechRow[] | null = null;
      if (data.partOfSpeechIds) {
        partsOfSpeech = await this.resolvePartsOfSpeech(
          db,
          data.partOfSpeechIds
        );
        newFields.set('has_pos_filter', partsOfSpeech.length > 0 ? 1 : 0);
      }

      if (data.name != null) {
        newFields.set(
          'name',
          validateName(db, field.id, field.language_id, data.name)
        );
      }
      if (data.nameAbbr != null) {
        newFields.set('name_abbr', data.nameAbbr.trim());
      }
      if (data.valueType != null) {
        newFields.set(
          'value_type',
          this.updateValueType(db, field, data.valueType)
        );
      }

      const newType = newFields.get('value_type') ?? field.value_type;
      const values = FieldValueMut.generatePatches(
        db,
        field,
        newType,
        data.listValues
      );

      if (newFields.hasValues) {
        db.exec`
          update fields
          set ${newFields}
          where id = ${field.id}
        `;
      }

      FieldValueMut.applyPatches(db, field.id, values);

      if (partsOfSpeech !== null) {
        this.deletePartsOfSpeech(db, field.id);
        this.insertPartsOfSpeech(db, field.id, partsOfSpeech);
      }

      events.emit({
        type: 'field',
        action: 'update',
        id: field.id,
        languageId: field.language_id,
      });
      logger.verbose(`Updated field: ${field.id}`);

      db.clearCache(Field.byIdKey, field.id);
      return Field.byIdRequired(db, field.id);
    });
  },

  updateValueType(
    db: DataReader,
    field: FieldRow,
    newType: FieldValueType
  ): RawFieldType {
    const newRawType = gqlFieldTypeToRaw(newType);

    const isSafeTypeChange =
      // No change at all is always allowed
      newRawType === field.value_type ||
      // List-one to list-many or vice versa is always safe
      isListType(newRawType) && isListType(field.value_type);

    // List to non-list, boolean to non-boolean, text to non-text – these
    // changes are only permitted if the field is unused. Otherwise, it's
    // not clear how we should deal with existing values.
    // Note: false boolean values are not stored in the database, meaning
    // we *can* change from boolean to non-boolean as long as there are no
    // *true* values anywhere.
    if (!isSafeTypeChange && Definition.anyUsesField(db, field.id)) {
      const message =
        `Field ${field.id} cannot change type from '${
          rawFieldTypeToGql(field.value_type)
        }' to ${newType}' because it is used by one or more definitions`;
      throw new UserInputError(message, {
        invalidArgs: ['valueType'],
      });
    }

    return newRawType;
  },

  delete(context: MutContext, id: FieldId): Promise<boolean> {
    return MutContext.transact(context, async context => {
      const {db, events, logger} = context;

      const field = await Field.byId(db, id);
      if (!field) {
        return false;
      }

      FieldValueMut.deleteAll(db, field.id);

      db.exec`
        delete from fields
        where id = ${field.id}
      `;

      events.emit({
        type: 'field',
        action: 'delete',
        id: field.id,
        languageId: field.language_id,
      });
      logger.verbose(`Deleted field: ${field.id}`);

      return true;
    });
  },

  resolvePartsOfSpeech(
    db: DataReader,
    inputIds: PartOfSpeechId[]
  ): Promise<PartOfSpeechRow[]> {
    if (inputIds.length === 0) {
      return Promise.resolve([]);
    }

    // We could treat an input array like [12, 12] as an error because it
    // contains a duplicate part of speech, but in practice it's harmless,
    // so we ignore it and remove the duplicates. Unfortunately, in order
    // to report errors correctly, we need to keep track of which index
    // each part of speech ID was at in the original input array.
    const seen = new Set<PartOfSpeechId>();
    const ids = inputIds.reduce(
      (ids, id, i) => {
        if (!seen.has(id)) {
          ids.push([id, i]);
          seen.add(id);
        }
        return ids;
      },
      [] as [PartOfSpeechId, number][]
    );

    return Promise.all(
      ids.map(([id, originalIndex]) =>
        PartOfSpeech.byIdRequired(
          db,
          id,
          `partOfSpeechIds.${originalIndex}`
        )
      )
    );
  },

  insertPartsOfSpeech(
    db: DataWriter,
    fieldId: FieldId,
    partsOfSpeech: PartOfSpeechRow[]
  ): void {
    if (partsOfSpeech.length === 0) {
      return;
    }

    db.exec`
      insert into field_parts_of_speech (field_id, part_of_speech_id)
      values ${partsOfSpeech.map(pos =>
        db.raw`(${fieldId}, ${pos.id})`
      )}
    `;
  },

  deletePartsOfSpeech(db: DataWriter, fieldId: FieldId): void {
    db.exec`
      delete from field_parts_of_speech
      where field_id = ${fieldId}
    `;
  },
} as const;

const FieldValueMut = {
  insert(
    context: MutContext,
    data: NewFieldValueInput
  ): Promise<FieldValueRow> {
    return MutContext.transact(context, async context => {
      const {db, events, logger} = context;

      const field = await Field.byIdRequired(db, data.fieldId, 'fieldId');
      if (!isListType(field.value_type)) {
        throw new UserInputError(
          `Field ${field.id} is not a list-type field`,
          {invalidArgs: ['fieldId']}
        );
      }

      const value = validateSingleValue(db, null, field.id, data.value);
      const valueAbbr = data.valueAbbr.trim();

      const {insertId: fieldValueId} = db.exec<FieldValueId>`
        insert into field_values (field_id, value, value_abbr)
        values (${field.id}, ${value}, ${valueAbbr})
      `;

      events.emit({
        type: 'field',
        action: 'update',
        id: field.id,
        languageId: field.language_id,
      });
      logger.verbose(
        `Created field value: ${fieldValueId} in field ${field.id}`
      );

      return FieldValue.byIdRequired(db, fieldValueId);
    });
  },

  insertAll(
    db: DataWriter,
    fieldId: FieldId,
    values: FieldValueInput[]
  ): void {
    if (values.length === 0) {
      return;
    }
    db.exec`
      insert into field_values (field_id, value, value_abbr)
      values ${values.map(v =>
        db.raw`(${fieldId}, ${v.value}, ${v.valueAbbr})`
      )}
    `;
  },

  update(
    context: MutContext,
    id: FieldValueId,
    data: EditFieldValueInput
  ): Promise<FieldValueRow> {
    return MutContext.transact(context, async context => {
      const {db, events, logger} = context;

      const fieldValue = await FieldValue.byIdRequired(db, id);
      const field = await Field.byIdRequired(db, fieldValue.field_id);

      const newFields = new FieldSet<FieldValueRow>();
      if (data.value != null) {
        newFields.set(
          'value',
          validateSingleValue(db, fieldValue.id, fieldValue.field_id, data.value)
        );
      }
      if (data.valueAbbr != null) {
        newFields.set('value_abbr', data.valueAbbr.trim());
      }

      if (newFields.hasValues) {
        db.exec`
          update field_values
          set ${newFields}
          where id = ${fieldValue.id}
        `;
      }

      events.emit({
        type: 'field',
        action: 'update',
        id: fieldValue.field_id,
        languageId: field.language_id,
      });
      logger.verbose(
        `Updated field value: ${fieldValue.id} in field ${fieldValue.field_id}`
      );

      db.clearCache(FieldValue.byIdKey, fieldValue.id);
      return FieldValue.byIdRequired(db, fieldValue.id);
    });
  },

  generatePatches(
    db: DataReader,
    field: FieldRow,
    newType: RawFieldType,
    values: FieldValueInput[] | null | undefined
  ): FieldValuePatches | null {
    const wasListType = isListType(field.value_type);
    const willBeListType = isListType(newType);

    if (!willBeListType) {
      // This field will not contain list values.
      if (values) {
        throw new UserInputError('A non-list field cannot have `listValues`', {
          invalidArgs: ['listValues'],
        });
      }

      if (wasListType) {
        // The field *was* a list type and is changing into a non-list type,
        // so we must delete all the previous values.
        return {deleted: 'all', updated: [], added: []};
      }

      // The field was not previously and will not be a list type. There are
      // no old values to delete and nothing new to insert.
      return null;
    } else if (!values) {
      // This field *will* contain list values, *and* none are specified.
      if (!wasListType) {
        throw new UserInputError(
          'A field that is changing to a list type must have `listValues`',
          {invalidArgs: ['listValues']}
        );
      }

      // The field was a list and still is a list, and listValues is null:
      // we should not touch the existing values at all.
      return null;
    }

    // First validate the new values
    const validValues = validateValues(db, values);

    // Fetch previous values so we can keep track of which ones to delete
    const prevValues = new Set(
      db.all<{id: FieldValueId}>`
        select id
        from field_values
        where field_id = ${field.id}
      `.map(r => r.id)
    );
    const seen = new Set<FieldValueId>();
    const updated: FieldValueInput[] = [];
    const added: FieldValueInput[] = [];

    let index = 0;
    for (const value of validValues) {
      if (value.id == null) {
        added.push(value);
      } else {
        if (!prevValues.has(value.id)) {
          throw new UserInputError(
            `Field value ${
              value.id
            } does not exist or belongs to a different field`,
            {invalidArgs: [`values.${index}.id`]}
          );
        }
        if (seen.has(value.id)) {
          throw new UserInputError(
            `Field value ID ${value.id} occurs more than once`,
            {invalidArgs: [`values.${index}.id`]}
          );
        }
        updated.push(value);
        seen.add(value.id);
      }
      index++;
    }

    // Any existing ID we haven't seen will be deleted
    const deleted = Array.from(prevValues).filter(id => !seen.has(id));
    return {deleted, updated, added};
  },

  applyPatches(
    db: DataWriter,
    fieldId: FieldId,
    patches: FieldValuePatches | null
  ): void {
    if (!patches) {
      return;
    }

    const {deleted, updated, added} = patches;

    // Perform deletions first, to prevent potential `value` conflicts
    if (deleted === 'all') {
      db.exec`
        delete from field_values
        where field_id = ${fieldId}
      `;
    } else if (deleted.length > 0) {
      db.exec`
        delete from field_values
        where id in (${deleted})
      `;
    }

    // If there are any updates to perform, we have to do things in a bit of
    // a roundabout manner. In the case that the user has decided to swap the
    // `value` text of two values, we *cannot* do that in separate UPDATEs, or
    // even the same update. Whichever way we do it, SQLite *will* complain
    // about duplicate entries for a unique key. Of course, we also can't tell
    // SQLite to ignore the constraint, even for a single transaction.
    //
    // The chosen solution is to rename every `value` to a randomly selected
    // string, which is exceedingly unlikely to collide with anything the user
    // has entered, and *then* update each field to the desired `value`.
    if (updated.length > 0) {
      // `updated` contains *every* field value that isn't new or deleted,
      // so we can safely perform this update based on the field ID.
      const randomValue = nanoid();
      db.exec`
        update field_values
        set value = id || ':' || ${randomValue}
        where field_id = ${fieldId}
      `;

      // TODO: add support for prepared statements and use one here
      for (const value of updated) {
        db.exec`
          update field_values
          set
            value = ${value.value},
            value_abbr = ${value.valueAbbr}
          where id = ${value.id}
        `;
      }
    }

    if (added.length > 0) {
      db.exec`
        insert into field_values (field_id, value, value_abbr)
        values ${added.map(v =>
          db.raw`(${fieldId}, ${v.value}, ${v.valueAbbr})`
        )}
      `;
    }
  },

  delete(context: MutContext, id: FieldValueId): Promise<boolean> {
    return MutContext.transact(context, async context => {
      const {db, events, logger} = context;

      const fieldValue = await FieldValue.byId(db, id);
      if (!fieldValue) {
        return false;
      }

      const field = await Field.byIdRequired(db, fieldValue.field_id);

      db.exec`
        delete from field_values
        where id = ${fieldValue.id}
      `;

      events.emit({
        type: 'field',
        action: 'update',
        id: field.id,
        languageId: field.language_id,
      });
      logger.verbose(
        `Deleted field value: ${fieldValue.id} in field ${field.id}`
      );

      return true;
    });
  },

  deleteAll(db: DataWriter, fieldId: FieldId): void {
    db.exec`
      delete from field_values
      where field_id = ${fieldId}
    `;
  },
} as const;

const isListType = (t: RawFieldType) =>
  t === RawFieldType.LIST_ONE ||
  t === RawFieldType.LIST_MANY;

export {
  FieldMut,
  FieldValueMut,
};
