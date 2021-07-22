import {UserInputError} from 'apollo-server';

import {DataReader} from '../../database';
import {LanguageId} from '../../graphql';

import {LanguageRow, LanguageStatsRow} from './types';

const Language = {
  byIdKey: 'Language.byId',

  all(db: DataReader): LanguageRow[] {
    return db.all<LanguageRow>`
      select *
      from languages
      order by name
    `;
  },

  byId(db: DataReader, id: LanguageId): Promise<LanguageRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) => db.all<LanguageRow>`
        select *
        from languages
        where id in (${ids})
      `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: LanguageId,
    paramName = 'id'
  ): Promise<LanguageRow> {
    const language = await this.byId(db, id);
    if (!language) {
      throw new UserInputError(`Language not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return language;
  },

  byName(db: DataReader, name: string): LanguageRow | null {
    return db.get<LanguageRow>`
      select *
      from languages
      where name = ${name}
    `;
  },
} as const;

const LanguageStats = {
  byIdKey: 'LanguageStats.byId',

  byId(db: DataReader, id: LanguageId): Promise<LanguageStatsRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) => db.all<LanguageStatsRow>`
        select
          l.id as id,
          l.lemma_count as lemma_count,
          count(distinct d.id) as definition_count,
          count(distinct pos.id) as part_of_speech_count,
          count(distinct dt.tag_id) as tag_count
        from languages l
        left join definitions d on d.language_id = l.id
        left join parts_of_speech pos on pos.language_id = l.id
        left join definition_tags dt on dt.definition_id = d.id
        where l.id in (${ids})
        group by l.id
      `,
      row => row.id
    );
  },
} as const;

export {Language, LanguageStats};
