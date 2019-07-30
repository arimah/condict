import Adaptor from '../../database/adaptor';

import validator, {lengthBetween, unique} from '../validator';
import sizeOfColumn from '../size-of-column';
import {LanguageId} from '../language/types';

import {PartOfSpeechId} from './types';

const NameSize = sizeOfColumn('parts_of_speech', 'name');

export const validateName = (
  db: Adaptor,
  currentId: PartOfSpeechId | null,
  languageId: LanguageId,
  value: string
): Promise<string> =>
  validator<string>('name')
    .do(value => value.trim())
    .do(lengthBetween(1, NameSize))
    .do(unique(
      currentId,
      async name => {
        const row = await db.get<{id: PartOfSpeechId}>`
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
