import {DataReader} from '../../database';
import {FieldId, FieldValueId, LanguageId} from '../../graphql';
import {UserInputError} from '../../errors';

import {FieldRow, FieldValueRow} from './types';

const Field = {
  byIdKey: 'Field.byId',
  allByLanguageKey: 'Field.allByLanguage',

  byId(db: DataReader, id: FieldId): Promise<FieldRow | null> {
    return db.batchOneToOne(
      Field.byIdKey,
      id,
      (db, ids) =>
        db.all<FieldRow>`
          select *
          from fields
          where id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: FieldId,
    paramName = 'id'
  ): Promise<FieldRow> {
    const field = await this.byId(db, id);
    if (!field) {
      throw new UserInputError(`Field not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return field;
  },

  byName(
    db: DataReader,
    languageId: LanguageId,
    name: string
  ): FieldRow | null {
    return db.get<FieldRow>`
      select *
      from fields
      where language_id = ${languageId}
        and name = ${name}
    `;
  },

  allByLanguage(db: DataReader, languageId: LanguageId): Promise<FieldRow[]> {
    return db.batchOneToMany(
      Field.allByLanguageKey,
      languageId,
      (db, languageIds) =>
        db.all<FieldRow>`
          select *
          from fields
          where language_id in (${languageIds})
          order by name
        `,
      row => row.language_id
    );
  },
} as const;

const FieldValue = {
  byIdKey: 'FieldValue.byId',
  allByFieldKey: 'FieldValue.allByField',

  byId(db: DataReader, id: FieldValueId): Promise<FieldValueRow | null> {
    return db.batchOneToOne(
      FieldValue.byIdKey,
      id,
      (db, ids) =>
        db.all<FieldValueRow>`
          select *
          from field_values
          where id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: FieldValueId,
    paramName = 'id'
  ): Promise<FieldValueRow> {
    const fieldValue = await this.byId(db, id);
    if (!fieldValue) {
      throw new UserInputError(`Field value not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return fieldValue;
  },

  allByField(db: DataReader, fieldId: FieldId): Promise<FieldValueRow[]> {
    return db.batchOneToMany(
      FieldValue.allByFieldKey,
      fieldId,
      (db, fieldIds) =>
        db.all<FieldValueRow>`
          select *
          from field_values
          where field_id in (${fieldIds})
          order by value
        `,
      row => row.field_id
    );
  },
} as const;

export {Field, FieldValue};
