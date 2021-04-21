import {DataReader} from '../../database';
import {LanguageId} from '../../graphql';

import validator, {minLength, unique} from '../validator';

export const validateName = (
  db: DataReader,
  currentId: LanguageId | null,
  value: string
): string =>
  validator<string>('name')
    .do(name => name.trim())
    .do(minLength(1, 'Language name cannot be empty'))
    .do(unique(
      currentId,
      name => {
        const row = db.get<{id: LanguageId}>`
          select id
          from languages
          where name = ${name}
        `;
        return row ? row.id : null;
      },
      name => `There is already a language with the name '${name}'`
    ))
    .validate(value);
