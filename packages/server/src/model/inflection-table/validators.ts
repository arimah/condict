import {normalizePattern} from '@condict/inflect';

import {Connection} from '../../database';
import {InflectionTableId, PartOfSpeechId} from '../../graphql/types';

import validator, {lengthBetween, unique} from '../validator';
import sizeOfColumn from '../size-of-column';

const TableNameSize = sizeOfColumn('inflection_tables', 'name');
const InflectionPatternSize = sizeOfColumn('inflected_forms', 'inflection_pattern');
const DisplayNameSize = sizeOfColumn('inflected_forms', 'display_name');

export const validateName = (
  db: Connection,
  currentId: InflectionTableId | null,
  partOfSpeechId: PartOfSpeechId,
  value: string
): string =>
  validator<string>('name')
    .do(value => value.trim())
    .do(lengthBetween(1, TableNameSize))
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
      name => `the part of speech already has a table named '${name}'`
    ))
    .validate(value);

export const validateFormInflectionPattern =
  validator<string>('inflectionPattern')
    .do(normalizePattern)
    .do(lengthBetween(0, InflectionPatternSize))
    .validate;

export const validateFormDisplayName =
  validator<string>('displayName')
    .do(value => value.trim())
    .do(lengthBetween(0,  DisplayNameSize))
    .validate;
