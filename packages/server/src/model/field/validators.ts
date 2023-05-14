import {DataReader} from '../../database';
import {FieldId, FieldValueId, LanguageId} from '../../graphql';

import validator, {minLength, unique} from '../validator';

export const validateName = (
  db: DataReader,
  currentId: FieldId | null,
  languageId: LanguageId,
  value: string
): string =>
  validator<string>('name')
    .do(value => value.trim())
    .do(minLength(1, 'Field name cannot be empty'))
    .do(unique(
      currentId,
      name => {
        const row = db.get<{id: FieldId}>`
          select id
          from fields
          where name = ${name}
            and language_id = ${languageId}
        `;
        return row ? row.id : null;
      },
      name => `The language already has a field named '${name}'`
    ))
    .validate(value);

export const validateValueText =
  validator<string>('value')
    .do(value => value.trim())
    .do(minLength(1, 'Field value cannot be empty'))
    .validate;

export const validateSingleValue = (
  db: DataReader,
  currentId: FieldValueId | null,
  fieldId: FieldId,
  value: string
): string =>
  validator<string>('value')
    .do(validateValueText)
    .do(unique(
      currentId,
      value => {
        const row = db.get<{id: FieldValueId}>`
          select id
          from field_values
          where value = ${value}
            and field_id = ${fieldId}
        `;
        return row ? row.id : null;
      },
      value => `The field already has a value '${value}'`
    ))
    .validate(value);
