import {validatePageParams} from '../../schema/helpers';
import {PageParams, Connection} from '../../schema/types';

import {LemmaRow, LemmaFilter} from './types';
import Model from '../model';

class Lemma extends Model {
  public readonly byIdKey = 'Lemma.byId';
  public readonly defaultPagination: Readonly<PageParams> = {
    page: 0,
    perPage: 50,
  };
  public readonly maxPerPage = 500;

  public byId(id: number): Promise<LemmaRow | null> {
    return this.db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<LemmaRow>`
          select *
          from lemmas
          where id in (${ids})
        `,
      row => row.id
    );
  }

  public byTerm(languageId: number, term: string): Promise<LemmaRow | null> {
    return this.db.batchOneToOne(
      this.byTermKey(languageId),
      term,
      (db, terms, languageId) =>
        db.all<LemmaRow>`
          select *
          from lemmas
          where language_id = ${languageId}
            and term_unique in (${terms})
        `,
      row => row.term_unique,
      languageId
    );
  }

  public byTermKey(languageId: number): string {
    return `Lemma.byTerm(${languageId})`;
  }

  public async allByLanguage(
    languageId: number,
    page: PageParams | undefined | null,
    filter: LemmaFilter
  ): Promise<Connection<LemmaRow>> {
    const {db} = this;
    const condition = db.raw`
      l.language_id = ${languageId | 0}
        ${
          filter === LemmaFilter.DEFINED_LEMMAS_ONLY ? db.raw`
            and exists (
              select 1
              from definitions d
              where d.lemma_id = l.id
            )` :
          filter === LemmaFilter.DERIVED_LEMMAS_ONLY ? db.raw`
            and exists (
              select 1
              from derived_definitions dd
              where dd.lemma_id = l.id
            )` :
          db.raw``
        }
    `;
    return this.db.paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      async db => {
        const {total} = await db.getRequired<{total: number}>`
          select count(*) as total
          from lemmas l
          where ${condition}
        `;
        return total;
      },
      (db, limit, offset) => db.all<LemmaRow>`
        select l.*
        from lemmas l
        where ${condition}
        order by l.term_display
        limit ${limit} offset ${offset}
      `
    );
  }
}

export default {Lemma};
