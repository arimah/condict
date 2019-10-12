import {UserInputError} from 'apollo-server';

import {Awaitable} from '../../database/adaptor';
import {LanguageId} from '../../graphql/types';

import {LanguageRow} from './types';
import Model from '../model';

class Language extends Model {
  public readonly byIdKey = 'Language.byId';

  public all(): Awaitable<LanguageRow[]> {
    return this.db.all<LanguageRow>`
      select *
      from languages
      order by name
    `;
  }

  public byId(id: LanguageId): Promise<LanguageRow | null> {
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

  public async byIdRequired(
    id: LanguageId,
    paramName: string = 'id'
  ): Promise<LanguageRow> {
    const language = await this.byId(id);
    if (!language) {
      throw new UserInputError(`Language not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return language;
  }

  public byName(name: string): Awaitable<LanguageRow | null> {
    return this.db.get<LanguageRow>`
      select *
      from languages
      where name = ${name}
    `;
  }
}

export default {Language};
