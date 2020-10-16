import {normalizePattern} from '@condict/inflect';

import {Connection} from '../../database';
import {InflectionTableId, PartOfSpeechId} from '../../graphql/types';

import validator, {minLength, unique} from '../validator';

export const validateName = (
  db: Connection,
  currentId: InflectionTableId | null,
  partOfSpeechId: PartOfSpeechId,
  value: string
): string =>
  validator<string>('name')
    .do(value => value.trim())
    .do(minLength(1, 'Inflection table name cannot be empty'))
    .do(unique(
      currentId,
      name => {
        const row = db.get<{id: InflectionTableId}>`
          select id
          from inflection_tables
          where name = ${name}
            and part_of_speech_id = ${partOfSpeechId}
        `;
        return row ? row.id : null;
      },
      name => `The part of speech already has a table named '${name}'`
    ))
    .validate(value);

export const validateFormInflectionPattern =
  validator<string>('inflectionPattern')
    .do(normalizePattern)
    .validate;

export const validateFormDisplayName =
  validator<string>('displayName')
    .do(value => value.trim())
    .validate;
