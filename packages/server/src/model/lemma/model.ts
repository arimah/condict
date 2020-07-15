import {GraphQLResolveInfo} from 'graphql';

import {validatePageParams} from '../../graphql/helpers';
import {
  LanguageId,
  LemmaId,
  LemmaFilter,
  PageParams,
} from '../../graphql/types';

import Model from '../model';
import paginate from '../paginate';
import {Connection} from '../types';

import {LemmaRow} from './types';

class Lemma extends Model {
  public readonly byIdKey = 'Lemma.byId';
  public readonly defaultPagination: Readonly<PageParams> = {
    page: 0,
    perPage: 50,
  };
  public readonly maxPerPage = 500;

  public byId(id: LemmaId): Promise<LemmaRow | null> {
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

  public byTerm(languageId: LanguageId, term: string): Promise<LemmaRow | null> {
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

  public byTermKey(languageId: LanguageId): string {
    return `Lemma.byTerm(${languageId})`;
  }

  public allByLanguage(
    languageId: LanguageId,
    page: PageParams | undefined | null,
    filter: LemmaFilter,
    info?: GraphQLResolveInfo
  ): Connection<LemmaRow> {
    const {db} = this;
    const condition = db.raw`
      l.language_id = ${languageId}
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
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(*) as total
          from lemmas l
          where ${condition}
        `;
        return total;
      },
      (limit, offset) => db.all<LemmaRow>`
        select l.*
        from lemmas l
        where ${condition}
        order by l.term_display
        limit ${limit} offset ${offset}
      `,
      info
    );
  }
}

export default {Lemma};
