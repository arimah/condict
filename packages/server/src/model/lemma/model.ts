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

import {
  isFilteringNeeded,
  isFilterImpossible,
  buildOwnDefinitionsSource,
  buildDerivedDefinitionsSource,
} from './filter';
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
    filter: LemmaFilter | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<LemmaRow> {
    page = validatePageParams(page || this.defaultPagination, this.maxPerPage);
    if (filter && isFilteringNeeded(filter)) {
      return this.allByLanguageFiltered(db, languageId, page, filter, info);
    } else {
      return this.allByLanguageUnfiltered(db, languageId, page, info);
    }
  },

  allByLanguageUnfiltered(
    db: DataReader,
    languageId: LanguageId,
    page: PageParams,
    info?: GraphQLResolveInfo
  ): ItemConnection<LemmaRow> {
    return paginate(
      page,
      () => {
        const {total} = db.getRequired<{total: number}>`
          select lng.lemma_count as total
          from languages lng
          where lng.id = ${languageId}
        `;
        return total;
      },
      (limit, offset) => db.all<LemmaRow>`
        select l.*
        from lemmas l
        where l.language_id = ${languageId}
        order by l.term
        limit ${limit} offset ${offset}
      `,
      info
    );
  },

  allByLanguageFiltered(
    db: DataReader,
    languageId: LanguageId,
    page: PageParams,
    filter: LemmaFilter,
    info?: GraphQLResolveInfo
  ): ItemConnection<LemmaRow> {
    if (isFilterImpossible(filter)) {
      return {
        page: {
          ...page,
          totalCount: 0,
        },
        nodes: [],
      };
    }

    // If tags are specified, force DEFINED_LEMMAS_ONLY, as we currently do not
    // support tag matching on derived definitions. If the value were previously
    // DERIVED_LEMMAS_ONLY, then the filter would be impossible, and we would
    // have returned above.
    if (filter.withTags) {
      filter.kind = 'DEFINED_LEMMAS_ONLY';
    }

    const joinType = filter.kind === 'ALL_LEMMAS' ? 'left' : 'inner';
    const source = db.raw`
      ${buildOwnDefinitionsSource(db, joinType, filter)}
      ${buildDerivedDefinitionsSource(db, joinType, filter)}
    `;
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(*) as total
          from lemmas l
          ${source}
          where l.language_id = ${languageId}
        `;
        return total;
      },
      (limit, offset) => db.all<LemmaRow>`
        select l.*
        from lemmas l
        ${source}
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
