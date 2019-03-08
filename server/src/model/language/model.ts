import {UserInputError} from 'apollo-server';

import Model from '../model';

export interface LanguageRow {
  id: number;
  lemma_count: number;
  name: string;
  url_name: string;
}

class Language extends Model {
  public readonly byIdKey = 'Language.byId';

  public all() {
    return this.db.all<LanguageRow>`
      select *
      from languages
      order by name
    `;
  }

  public byId(id: number) {
    return this.db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) => db.all<LanguageRow>`
        select *
        from languages
        where id in (${ids})
      `,
      row => row.id
    );
  }

  public async byIdRequired(id: number, paramName: string = 'id') {
    const language = await this.byId(id);
    if (!language) {
      throw new UserInputError(`Language not found: ${id}`, {
        invalidArgs: [paramName]
      });
    }
    return language;
  }

  public byName(name: string) {
    return this.db.get<LanguageRow>`
      select *
      from languages
      where name = ${name}
    `;
  }

  public byUrlName(urlName: string) {
    return this.db.get<LanguageRow>`
      select *
      from languages
      where url_name = ${urlName}
    `;
  }
}

export default {Language};
