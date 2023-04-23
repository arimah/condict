import {DataReader} from '../../database';
import {FieldId, LanguageId, PartOfSpeechId} from '../../graphql';
import {UserInputError} from '../../errors';

import {PartOfSpeechRow, PartOfSpeechStatsRow} from './types';

const PartOfSpeech = {
  byIdKey: 'PartOfSpeech.byId',
  allByLanguageKey: 'PartOfSpeech.allByLanguage',
  allByFieldKey: 'PartOfSpeech.allByField',

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

  allByField(
    db: DataReader,
    fieldId: FieldId
  ): Promise<PartOfSpeechRow[]> {
    type Row = PartOfSpeechRow & {
      field_id: FieldId;
    };
    return db.batchOneToMany(
      this.allByFieldKey,
      fieldId,
      (db, fieldIds) =>
        db.all<Row>`
          select
            pos.*,
            fpos.field_id as field_id
          from field_parts_of_speech fpos
          inner join parts_of_speech pos on pos.id = fpos.part_of_speech_id
          where fpos.field_id in (${fieldIds})
        `,
      row => row.field_id
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
          count(distinct d.id) as definition_count
        from parts_of_speech pos
        left join definitions d on d.part_of_speech_id = pos.id
        where pos.id in (${ids})
        group by pos.id
      `,
      row => row.id
    );
  },
};

export {PartOfSpeech, PartOfSpeechStats};
