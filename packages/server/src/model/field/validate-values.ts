import {DataReader} from '../../database';
import {UserInputError} from '../../errors';

import {validateValueText} from './validators';

interface FieldValue {
  readonly value: string;
  readonly valueAbbr: string;
}

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

  type Row = {
    value: string;
    indices: string;
  };

  // To check for duplicates, we have to go via the database, as we have no
  // JavaScript implementation of the Unicode collation. SQLite's VALUES()
  // syntax allows us to create an anonymous table for a single query, with
  // no need for a temporary table.
  const duplicates = db.all<Row>`
    select
      v.column1 as value,
      group_concat(v.column2, ',') as indices
    from (
      values ${validValues.map((v, i) =>
        db.raw`(${v.value}, ${i})`
      )}
    ) v
    group by value collate unicode
    having count(*) > 1
  `;

  if (duplicates.length > 0) {
    let message: string;
    if (duplicates.length === 1) {
      message = `Field value occurs more than once: ${duplicates[0].value}`;
    } else {
      message = `Field values occur more than once:\n- ${
        duplicates.map(d => d.value).join('\n- ')
      }`;
    }
    throw new UserInputError(message, {
      duplicates: duplicates.map(d => ({
        value: d.value,
        indices: d.indices.split(',').map(x => +x),
      })),
    });
  }

  return validValues;
};

export default validateValues;
