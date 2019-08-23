import {UserInputError} from 'apollo-server';

import {validatePageParams} from '../../graphql/helpers';
import {
  TagId,
  LanguageId,
  LemmaId,
  DefinitionId,
  PageParams,
} from '../../graphql/types';
import {Connection} from '../../graphql/resolvers/types';

import Model from '../model';

import {TagRow, DefinitionTagRow, LemmaTagRow} from './types';

class Tag extends Model {
  public readonly byIdKey = 'Tag.byId';
  public readonly byNameKey = 'Tag.byName';
  public readonly allByLemmaKey = 'Tags.allByLemma';
  public readonly allByDefinitionKey = 'Tags.allByDefinition';
  public readonly defaultPagination: Readonly<PageParams> = {
    page: 0,
    perPage: 50,
  };
  public readonly maxPerPage = 200;

  public all(page?: PageParams | null): Promise<Connection<TagRow>> {
    return this.db.paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      async db => {
        const row = await db.getRequired<{total: number}>`
          select count(*) as total
          from tags
        `;
        return row.total;
      },
      (db, limit, offset) =>
        db.all<TagRow>`
          select *
          from tags
          order by name
          limit ${limit} offset ${offset}
        `
    );
  }

  public allByLanguage(
    languageId: LanguageId,
    page?: PageParams | null
  ): Promise<Connection<TagRow>> {
    return this.db.paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      async db => {
        const row = await db.getRequired<{total: number}>`
          select count(distinct t.id) as total
          from definition_tags dt
          inner join tags t on t.id = dt.tag_id
          inner join definitions d on d.id = dt.definition_id
          where d.language_id = ${languageId}
        `;
        return row.total;
      },
      (db, limit, offset) =>
        db.all<TagRow>`
          select t.*
          from definition_tags dt
          inner join tags t on t.id = dt.tag_id
          inner join definitions d on d.id = dt.definition_id
          where d.language_id = ${languageId}
          group by t.id
          order by t.name
          limit ${limit} offset ${offset}
        `
    );
  }

  public byId(id: TagId): Promise<TagRow | null> {
    return this.db.batchOneToOne(
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
  }

  public async byIdRequired(
    id: TagId,
    paramName: string = 'id'
  ): Promise<TagRow> {
    const tag = await this.byId(id);
    if (!tag) {
      throw new UserInputError(`Tag not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return tag;
  }

  public async byName(name: string): Promise<TagRow | null> {
    return this.db.batchOneToOne(
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
  }

  public async allByLemma(lemmaId: LemmaId): Promise<TagRow[]> {
    return this.db.batchOneToMany(
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
  }

  public async allByDefinition(definitionId: DefinitionId): Promise<TagRow[]> {
    return this.db.batchOneToMany(
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
  }
}

export default {Tag};
