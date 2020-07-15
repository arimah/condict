import {Connection} from '../../database';
import {PartOfSpeechId, LanguageId} from '../../graphql/types';

import validator, {lengthBetween, unique} from '../validator';
import sizeOfColumn from '../size-of-column';

const NameSize = sizeOfColumn('parts_of_speech', 'name');

export const validateName = (
  db: Connection,
  currentId: PartOfSpeechId | null,
  languageId: LanguageId,
  value: string
): string =>
  validator<string>('name')
    .do(value => value.trim())
    .do(lengthBetween(1, NameSize))
    .do(unique(
      currentId,
      name => {
        const row = db.get<{id: PartOfSpeechId}>`
          select id
          from parts_of_speech
          where name = ${name}
            and language_id = ${languageId}
        `;
        return row ? row.id : null;
      },
      name => `the language already has a part of speech named '${name}'`
    ))
    .validate(value);
