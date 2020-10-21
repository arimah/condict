import {UserInputError} from 'apollo-server';
import {GraphQLResolveInfo} from 'graphql';

import {Connection} from '../../database';
import {
  TagId,
  LanguageId,
  LemmaId,
  DefinitionId,
  PageParams,
  validatePageParams,
} from '../../graphql';

import paginate from '../paginate';
import {ItemConnection} from '../types';

import {TagRow, DefinitionTagRow, LemmaTagRow} from './types';

const Tag = {
  byIdKey: 'Tag.byId',
  byNameKey: 'Tag.byName',
  allByLemmaKey: 'Tags.allByLemma',
  allByDefinitionKey: 'Tags.allByDefinition',
  defaultPagination: {
    page: 0,
    perPage: 50,
  },
  maxPerPage: 200,

  all(
    db: Connection,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<TagRow> {
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      () => {
        const row = db.getRequired<{total: number}>`
          select count(*) as total
          from tags
        `;
        return row.total;
      },
      (limit, offset) =>
        db.all<TagRow>`
          select *
          from tags
          order by name
          limit ${limit} offset ${offset}
        `,
      info
    );
  },

  allByLanguage(
    db: Connection,
    languageId: LanguageId,
    page?: PageParams | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<TagRow> {
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      () => {
        const row = db.getRequired<{total: number}>`
          select count(distinct t.id) as total
          from definition_tags dt
          inner join tags t on t.id = dt.tag_id
          inner join definitions d on d.id = dt.definition_id
          where d.language_id = ${languageId}
        `;
        return row.total;
      },
      (limit, offset) =>
        db.all<TagRow>`
          select t.*
          from definition_tags dt
          inner join tags t on t.id = dt.tag_id
          inner join definitions d on d.id = dt.definition_id
          where d.language_id = ${languageId}
          group by t.id
          order by t.name
          limit ${limit} offset ${offset}
        `,
      info
    );
  },

  byId(db: Connection, id: TagId): Promise<TagRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<TagRow>`
          select *
          from tags
          where id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: Connection,
    id: TagId,
    paramName = 'id'
  ): Promise<TagRow> {
    const tag = await this.byId(db, id);
    if (!tag) {
      throw new UserInputError(`Tag not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return tag;
  },

  byName(db: Connection, name: string): Promise<TagRow | null> {
    return db.batchOneToOne(
      this.byNameKey,
      name,
      (db, names) =>
        db.all<TagRow>`
          select *
          from tags
          where name in (${names})
        `,
      row => row.name
    );
  },

  allByLemma(db: Connection, lemmaId: LemmaId): Promise<TagRow[]> {
    return db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId,
      (db, lemmaIds) =>
        db.all<LemmaTagRow>`
          select
            t.*,
            d.lemma_id
          from definition_tags dt
          inner join tags t on t.id = dt.tag_id
          inner join definitions d on d.id = dt.definition_id
          where d.lemma_id in (${lemmaIds})
          group by d.lemma_id, t.id
          order by d.lemma_id, t.name
        `,
      row => row.lemma_id
    );
  },

  allByDefinition(
    db: Connection,
    definitionId: DefinitionId
  ): Promise<TagRow[]> {
    return db.batchOneToMany(
      this.allByDefinitionKey,
      definitionId,
      (db, definitionIds) =>
        db.all<DefinitionTagRow>`
          select
            t.*,
            dt.definition_id
          from definition_tags dt
          inner join tags t on t.id = dt.tag_id
          where dt.definition_id in (${definitionIds})
          order by dt.definition_id, t.name
        `,
      row => row.definition_id
    );
  },
} as const;

export {Tag};
