import {UserInputError} from 'apollo-server';

import Model from '../model';

export interface PartOfSpeechRow {
  id: number;
  language_id: number;
  name: string;
}

class PartOfSpeech extends Model {
  public readonly byIdKey = 'PartOfSpeech.byId';
  public readonly allByLanguageKey = 'PartOfSpeech.allByLanguage';

  public byId(id: number): Promise<PartOfSpeechRow | null> {
    return this.db.batchOneToOne(
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
  }

  public async byIdRequired(
    id: number,
    paramName: string = 'id'
  ): Promise<PartOfSpeechRow> {
    const partOfSpeech = await this.byId(id);
    if (!partOfSpeech) {
      throw new UserInputError(`Part of speech not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return partOfSpeech;
  }

  public allByLanguage(languageId: number): Promise<PartOfSpeechRow[]> {
    return this.db.batchOneToMany(
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
  }
}

export default {PartOfSpeech};
