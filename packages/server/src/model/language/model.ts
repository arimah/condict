import {UserInputError} from 'apollo-server';

import {DataReader} from '../../database';
import {LanguageId} from '../../graphql';

import {LanguageRow, LanguageDescriptionRow} from './types';

const Language = {
  byIdKey: 'Language.byId',

  all(db: DataReader): LanguageRow[] {
    return db.all<LanguageRow>`
      select *
      from languages
      order by name collate unicode
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

const LanguageDescription = {
  rawByLanguageKey: 'LanguageDescription.rawByLanguage',

  rawByLanguage(db: DataReader, languageId: LanguageId): Promise<string> {
    return db
      .batchOneToOne(
        this.rawByLanguageKey,
        languageId,
        (db, languageIds) =>
          db.all<LanguageDescriptionRow>`
            select *
            from language_descriptions
            where language_id in (${languageIds})
          `,
        row => row.language_id
      )
      .then(row => row ? row.description : '[]');
  },
} as const;

export {Language, LanguageDescription};
