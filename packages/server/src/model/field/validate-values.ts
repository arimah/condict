import {DataReader} from '../../database';
import {FieldValueDuplicate} from '../../graphql';
import {UserInputError} from '../../errors';

import {validateValueText} from './validators';

export interface FieldValue {
  readonly value: string;
  readonly valueAbbr: string;
}

export type ValueWithIndex = readonly [value: string, index: number];

const validateValues = <V extends FieldValue>(
  db: DataReader,
  values: V[]
): V[] => {
  if (values.length === 0) {
    return [];
  }

  const validValues = values.map<V>(x => ({
    ...x,
    value: validateValueText(x.value),
    valueAbbr: x.valueAbbr.trim(),
  }));

  const duplicates = findDuplicateFieldValues(
    db,
    values.map((v, i) => [v.value, i])
  );
  if (duplicates.length > 0) {
    let message: string;
    if (duplicates.length === 1) {
      message = `Field value occurs more than once: ${
        duplicates[0].normalizedValue
      }`;
    } else {
      message = `Field values occur more than once:\n- ${
        duplicates.map(d => d.normalizedValue).join('\n- ')
      }`;
    }
    throw new UserInputError(message, {duplicates});
  }

  return validValues;
};

export default validateValues;

export const findDuplicateFieldValues = (
  db: DataReader,
  values: ValueWithIndex[]
): FieldValueDuplicate[] => {
  type Row = {
    value: string;
    indices: string;
  };

  if (values.length === 0) {
    return [];
  }

  // To check for duplicates, we have to go via the database, as we have no
  // JavaScript implementation of the Unicode collation. SQLite's VALUES()
  // syntax allows us to create an anonymous table for a single query, with
  // no need for a temporary table.
  const duplicates = db.all<Row>`
    select
      v.column1 as value,
      group_concat(v.column2, ',') as indices
    from (
      values ${values.map(([v, i]) =>
        db.raw`(${v}, ${i})`
      )}
    ) v
    group by value collate unicode
    having count(*) > 1
  `;

  if (duplicates.length > 0) {
    return duplicates.map(d => ({
      normalizedValue: d.value,
      indices: d.indices.split(',').map(x => +x),
    }));
  }
  return [];
};
