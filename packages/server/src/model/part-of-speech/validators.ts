import {Connection} from '../../database';
import {PartOfSpeechId, LanguageId} from '../../graphql';

import validator, {minLength, unique} from '../validator';

export const validateName = (
  db: Connection,
  currentId: PartOfSpeechId | null,
  languageId: LanguageId,
  value: string
): string =>
  validator<string>('name')
    .do(value => value.trim())
    .do(minLength(1, 'Part of speech name cannot be empty'))
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
      name => `The language already has a part of speech named '${name}'`
    ))
    .validate(value);
