import {UserInputError} from 'apollo-server';

import {DataReader} from '../../database';
import {LanguageId, PartOfSpeechId} from '../../graphql';

import {PartOfSpeechRow} from './types';

const PartOfSpeech = {
  byIdKey: 'PartOfSpeech.byId',
  allByLanguageKey: 'PartOfSpeech.allByLanguage',

  byId(db: DataReader, id: PartOfSpeechId): Promise<PartOfSpeechRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<PartOfSpeechRow>`
          select *
          from parts_of_speech
          where id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: PartOfSpeechId,
    paramName = 'id'
  ): Promise<PartOfSpeechRow> {
    const partOfSpeech = await this.byId(db, id);
    if (!partOfSpeech) {
      throw new UserInputError(`Part of speech not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return partOfSpeech;
  },

  allByLanguage(
    db: DataReader,
    languageId: LanguageId
  ): Promise<PartOfSpeechRow[]> {
    return db.batchOneToMany(
      this.allByLanguageKey,
      languageId,
      (db, languageIds) =>
        db.all<PartOfSpeechRow>`
          select *
          from parts_of_speech
          where language_id in (${languageIds})
          order by name
        `,
      row => row.language_id
    );
  },
} as const;

export {PartOfSpeech};
