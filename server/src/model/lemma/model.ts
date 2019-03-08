import {validatePageParams, createConnection} from '../../schema/helpers';
import {PageParams} from '../../schema/types';

import Model from '../model';

export interface LemmaRow {
  id: number;
  language_id: number;
  term_unique: string;
  term_display: string;
}

export const enum LemmaFilter {
  ALL_LEMMAS = 'ALL_LEMMAS',
  DEFINED_LEMMAS_ONLY = 'DEFINED_LEMMAS_ONLY',
  DERIVED_LEMMAS_ONLY = 'DERIVED_LEMMAS_ONLY',
}

class Lemma extends Model {
  public readonly byIdKey = 'Lemma.byId';
  public readonly defaultPagination: Readonly<PageParams> = {
    page: 0,
    perPage: 50,
  };
  public readonly maxPerPage = 500;

  public byId(id: number) {
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

  public byTerm(languageId: number, term: string) {
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

  public byTermKey(languageId: number) {
    return `Lemma.byTerm(${languageId})`;
  }

  public async allByLanguage(
    languageId: number,
    page: PageParams | undefined | null,
    filter: LemmaFilter
  ) {
    page = validatePageParams(page || this.defaultPagination, this.maxPerPage);

    // The pagination parameters make batching difficult and probably unnecessary.
    const offset = page.page * page.perPage;
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
    const {total: totalCount} = await db.get`
      select count(*) as total
      from lemmas l
      where ${condition}
    ` as {total: number};
    const nodes = await db.all<LemmaRow>`
      select l.*
      from lemmas l
      where ${condition}
      order by l.term_display
      limit ${page.perPage} offset ${offset}
    `;
    return createConnection(page, totalCount, nodes);
  }
}

export default {Lemma};
