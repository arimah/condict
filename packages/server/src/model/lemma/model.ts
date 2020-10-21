import {GraphQLResolveInfo} from 'graphql';

import {Connection} from '../../database';
import {
  LanguageId,
  LemmaId,
  LemmaFilter,
  PageParams,
  validatePageParams,
} from '../../graphql';

import paginate from '../paginate';
import {ItemConnection} from '../types';

import {LemmaRow} from './types';

const Lemma = {
  byIdKey: 'Lemma.byId',
  defaultPagination: {
    page: 0,
    perPage: 50,
  },
  maxPerPage: 500,

  byId(db: Connection, id: LemmaId): Promise<LemmaRow | null> {
    return db.batchOneToOne(
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
  },

  byTerm(
    db: Connection,
    languageId: LanguageId,
    term: string
  ): Promise<LemmaRow | null> {
    return db.batchOneToOne(
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
  },

  byTermKey(languageId: LanguageId): string {
    return `Lemma.byTerm(${languageId})`;
  },

  allByLanguage(
    db: Connection,
    languageId: LanguageId,
    page: PageParams | undefined | null,
    filter: LemmaFilter,
    info?: GraphQLResolveInfo
  ): ItemConnection<LemmaRow> {
    const condition = db.raw`
      l.language_id = ${languageId}
        ${
          filter === 'DEFINED_LEMMAS_ONLY' ? db.raw`
            and exists (
              select 1
              from definitions d
              where d.lemma_id = l.id
            )` :
          filter === 'DERIVED_LEMMAS_ONLY' ? db.raw`
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
  },
} as const;

export {Lemma};
