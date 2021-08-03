import {GraphQLResolveInfo} from 'graphql';

import {DataReader} from '../../database';
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

  byId(db: DataReader, id: LemmaId): Promise<LemmaRow | null> {
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
    db: DataReader,
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
            and term in (${terms})
        `,
      row => row.term,
      languageId
    );
  },

  byTermKey(languageId: LanguageId): string {
    return `Lemma.byTerm(${languageId})`;
  },

  allByLanguage(
    db: DataReader,
    languageId: LanguageId,
    page: PageParams | undefined | null,
    filter: LemmaFilter,
    info?: GraphQLResolveInfo
  ): ItemConnection<LemmaRow> {
    const join =
      filter === 'DEFINED_LEMMAS_ONLY'
        ? db.raw`inner join definitions d on d.lemma_id = l.id`
        : filter === 'DERIVED_LEMMAS_ONLY'
          ? db.raw`inner join derived_definitions dd on dd.lemma_id = l.id`
          : db.raw``;
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(*) as total
          from lemmas l
          ${join}
          where l.language_id = ${languageId}
        `;
        return total;
      },
      (limit, offset) => db.all<LemmaRow>`
        select l.*
        from lemmas l
        ${join}
        where l.language_id = ${languageId}
        order by l.term
        limit ${limit} offset ${offset}
      `,
      info
    );
  },

  firstInLanguage(db: DataReader, languageId: LanguageId): LemmaRow | null {
    return db.get<LemmaRow>`
      select *
      from lemmas
      where language_id = ${languageId}
      order by term asc
      limit 1
    `;
  },

  lastInLanguage(db: DataReader, languageId: LanguageId): LemmaRow | null {
    return db.get<LemmaRow>`
      select *
      from lemmas
      where language_id = ${languageId}
      order by term desc
      limit 1
    `;
  },
} as const;

export {Lemma};
