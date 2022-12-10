import {DataReader} from '../../database';
import {LanguageId, PartOfSpeechId} from '../../graphql';
import {UserInputError} from '../../errors';

import {PartOfSpeechRow, PartOfSpeechStatsRow} from './types';

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

  byName(
    db: DataReader,
    languageId: LanguageId,
    name: string
  ): PartOfSpeechRow | null {
    return db.get<PartOfSpeechRow>`
      select *
      from parts_of_speech
      where language_id = ${languageId}
        and name = ${name}
    `;
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

const PartOfSpeechStats = {
  byIdKey: 'PartOfSpeechStats.byId',

  byId(
    db: DataReader,
    id: PartOfSpeechId
  ): Promise<PartOfSpeechStatsRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) => db.all<PartOfSpeechStatsRow>`
        select
          pos.id as id,
          count(distinct it.id) as inflection_table_count,
          count(distinct d.id) as definition_count
        from parts_of_speech pos
        left join inflection_tables it on it.part_of_speech_id = pos.id
        left join definitions d on d.part_of_speech_id = pos.id
        where pos.id in (${ids})
        group by pos.id
      `,
      row => row.id
    );
  },
};

export {PartOfSpeech, PartOfSpeechStats};
