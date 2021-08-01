import {UserInputError} from 'apollo-server';
import {GraphQLResolveInfo} from 'graphql';

import {DataReader, RawSql} from '../../database';
import {
  DefinitionId,
  DefinitionInflectionTableId,
  LanguageId,
  LemmaId,
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  RecentItemOrder,
  PageParams,
  validatePageParams,
} from '../../graphql';

import paginate from '../paginate';
import {ItemConnection} from '../types';

import {
  DefinitionRow,
  DefinitionStemRow,
  DefinitionInflectionTableRow,
  CustomInflectedFormRow,
  DerivedDefinitionRow,
} from './types';

const Definition = {
  byIdKey: 'Definition.byId',
  allByLemmaKey: 'Definition.allByLemma',
  defaultPagination: {
    page: 0,
    perPage: 50,
  },
  maxPerPage: 200,
  maxRecentPerPage: 100,

  byId(db: DataReader, id: DefinitionId): Promise<DefinitionRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<DefinitionRow>`
          select
            d.*,
            l.term as term
          from definitions d
          inner join lemmas l on l.id = d.lemma_id
          where d.id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: DefinitionId,
    paramName = 'id'
  ): Promise<DefinitionRow> {
    const definition = await this.byId(db, id);
    if (!definition) {
      throw new UserInputError(`Definition not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return definition;
  },

  allByLemma(db: DataReader, lemmaId: LemmaId): Promise<DefinitionRow[]> {
    return db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId,
      (db, lemmaIds) =>
        db.all<DefinitionRow>`
          select
            d.*,
            l.term as term
          from definitions d
          inner join lemmas l on l.id = d.lemma_id
          where d.lemma_id in (${lemmaIds})
          order by d.id
        `,
      row => row.lemma_id
    );
  },

  anyUsesInflectionTableCond(db: DataReader, condition: RawSql): boolean {
    const {used} = db.getRequired<{used: number}>`
      select exists (
        select 1
        from definition_inflection_tables
        where ${condition}
      ) as used
    `;
    return used === 1;
  },

  anyUsesInflectionTable(db: DataReader, tableId: InflectionTableId): boolean {
    return this.anyUsesInflectionTableCond(
      db,
      db.raw`inflection_table_id = ${tableId}`
    );
  },

  anyUsesInflectionTableLayout(
    db: DataReader,
    versionId: InflectionTableLayoutId
  ): boolean {
    return this.anyUsesInflectionTableCond(
      db,
      db.raw`inflection_table_version_id = ${versionId}`
    );
  },

  allByInflectionTableCond(
    db: DataReader,
    condition: RawSql,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<DefinitionRow> {
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(distinct dit.definition_id) as total
          from definition_inflection_tables dit
          where ${condition}
        `;
        return total;
      },
      (limit, offset) => db.all<DefinitionRow>`
        select
          d.*,
          l.term as term
        from definition_inflection_tables dit
        inner join definitions d on d.id = dit.definition_id
        inner join lemmas l on l.id = d.lemma_id
        where ${condition}
        group by d.id
        order by l.term, d.id
        limit ${limit} offset ${offset}
      `,
      info
    );
  },

  allByInflectionTable(
    db: DataReader,
    tableId: InflectionTableId,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<DefinitionRow> {
    return this.allByInflectionTableCond(
      db,
      db.raw`dit.inflection_table_id = ${tableId}`,
      page,
      info
    );
  },

  allByInflectionTableLayout(
    db: DataReader,
    versionId: InflectionTableLayoutId,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<DefinitionRow> {
    return this.allByInflectionTableCond(
      db,
      db.raw`dit.inflection_table_version_id = ${versionId}`,
      page,
      info
    );
  },

  anyUsesPartOfSpeech(
    db: DataReader,
    partOfSpeechId: PartOfSpeechId
  ): boolean {
    const {used} = db.getRequired<{used: number}>`
      select exists (
        select 1
        from definitions
        where part_of_speech_id = ${partOfSpeechId}
      ) as used
    `;
    return used === 1;
  },

  allByPartOfSpeech(
    db: DataReader,
    partOfSpeechId: PartOfSpeechId,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<DefinitionRow> {
    const condition = db.raw`
      d.part_of_speech_id = ${partOfSpeechId}
    `;
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(*) as total
          from definitions d
          where ${condition}
        `;
        return total;
      },
      (limit, offset) => db.all<DefinitionRow>`
        select
          d.*,
          l.term as term
        from definitions d
        inner join lemmas l on l.id = d.lemma_id
        where ${condition}
        order by l.term, d.id
        limit ${limit} offset ${offset}
      `,
      info
    );
  },

  recentByLanguage(
    db: DataReader,
    languageId: LanguageId,
    page: PageParams | undefined | null,
    order: RecentItemOrder | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<DefinitionRow> {
    const condition = db.raw`
      d.language_id = ${languageId}
    `;
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxRecentPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(*) as total
          from definitions d
          where ${condition}
        `;
        return total;
      },
      (limit, offset) => db.all<DefinitionRow>`
        select
          d.*,
          l.term as term
        from definitions d
        inner join lemmas l on l.id = d.lemma_id
        where ${condition}
        order by ${
          order === 'MOST_RECENTLY_CREATED'
            ? db.raw`d.time_created`
            : db.raw`d.time_updated`
        } desc
        limit ${limit} offset ${offset}
      `,
      info
    );
  },
} as const;

const DefinitionStem = {
  allByDefinitionKey: 'DefinitionStem.allByDefinition',

  allByDefinition(
    db: DataReader,
    definitionId: DefinitionId
  ): Promise<DefinitionStemRow[]> {
    return db.batchOneToMany(
      this.allByDefinitionKey,
      definitionId,
      (db, definitionIds) =>
        db.all<DefinitionStemRow>`
          select *
          from definition_stems
          where definition_id in (${definitionIds})
          order by definition_id, name collate unicode
        `,
      row => row.definition_id
    );
  },
} as const;

const DefinitionInflectionTable = {
  byIdKey: 'DefinitionInflectionTable.byId',
  allByDefinitionKey: 'DefinitionInflectionTable.allByDefinition',

  byId(
    db: DataReader,
    id: DefinitionInflectionTableId
  ): Promise<DefinitionInflectionTableRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<DefinitionInflectionTableRow>`
          select *
          from definition_inflection_tables
          where id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: DefinitionInflectionTableId,
    paramName = 'id'
  ): Promise<DefinitionInflectionTableRow> {
    const table = await this.byId(db, id);
    if (!table) {
      throw new UserInputError(`Definition inflection table not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return table;
  },

  allByDefinition(
    db: DataReader,
    definitionId: DefinitionId
  ): Promise<DefinitionInflectionTableRow[]> {
    return db.batchOneToMany(
      this.allByDefinitionKey,
      definitionId,
      (db, definitionIds) =>
        db.all<DefinitionInflectionTableRow>`
          select *
          from definition_inflection_tables
          where definition_id in (${definitionIds})
          order by definition_id, sort_order
        `,
      row => row.definition_id
    );
  },
} as const;

const CustomInflectedForm = {
  allByTableKey: 'CustomInflectedForm.allByTable',

  allByTable(
    db: DataReader,
    tableId: DefinitionInflectionTableId
  ): Promise<CustomInflectedFormRow[]> {
    return db.batchOneToMany(
      this.allByTableKey,
      tableId,
      (db, tableIds) =>
        db.all<CustomInflectedFormRow>`
          select *
          from definition_forms
          where definition_inflection_table_id in (${tableIds})
          order by definition_inflection_table_id, inflected_form_id
        `,
      row => row.definition_inflection_table_id
    );
  },
} as const;

const DerivedDefinition = {
  allByLemmaKey: 'DerivedDefinition.allByLemma',
  defaultPagination: {
    page: 0,
    perPage: 50,
  },
  maxPerPage: 200,

  allByLemma(
    db: DataReader,
    lemmaId: LemmaId
  ): Promise<DerivedDefinitionRow[]> {
    return db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId,
      (db, lemmaIds) =>
        db.all<DerivedDefinitionRow>`
          select
            dd.*,
            l.term as term,
            l.language_id
          from derived_definitions dd
          inner join lemmas l on l.id = dd.lemma_id
          where dd.lemma_id in (${lemmaIds})
          order by dd.original_definition_id, dd.inflected_form_id
        `,
      row => row.lemma_id
    );
  },

  allByDerivedFrom(
    db: DataReader,
    definitionId: DefinitionId,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<DerivedDefinitionRow> {
    const condition = db.raw`
      dd.original_definition_id = ${definitionId}
    `;
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(*) as total
          from derived_definitions dd
          where ${condition}
        `;
        return total;
      },
      (limit, offset) => db.all<DerivedDefinitionRow>`
        select
          dd.*,
          l.term as term,
          l.language_id
        from derived_definitions dd
        inner join lemmas l on l.id = dd.lemma_id
        where ${condition}
        order by l.term, dd.inflected_form_id
        limit ${limit} offset ${offset}
      `,
      info
    );
  },
} as const;

export {
  Definition,
  DefinitionStem,
  DefinitionInflectionTable,
  CustomInflectedForm,
  DerivedDefinition,
};
