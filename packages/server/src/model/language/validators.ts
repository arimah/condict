import {Connection} from '../../database';
import {LanguageId} from '../../graphql/types';

import validator, {lengthBetween, unique} from '../validator';
import sizeOfColumn from '../size-of-column';

const NameSize = sizeOfColumn('languages', 'name');

export const validateName = (
  db: Connection,
  currentId: LanguageId | null,
  value: string
): string =>
  validator<string>('name')
    .do(name => name.trim())
    .do(lengthBetween(1, NameSize))
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
      name => `there is already a language with the name '${name}'`
    ))
    .validate(value);
