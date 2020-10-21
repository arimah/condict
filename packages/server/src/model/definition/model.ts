import {UserInputError} from 'apollo-server';
import {GraphQLResolveInfo} from 'graphql';

import {Connection} from '../../database';
import {
  DefinitionId,
  DefinitionInflectionTableId,
  LemmaId,
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  PageParams,
  validatePageParams,
} from '../../graphql';

import paginate from '../paginate';
import {ItemConnection} from '../types';

import {
  DefinitionRow,
  DefinitionDescriptionRow,
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

  byId(db: Connection, id: DefinitionId): Promise<DefinitionRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<DefinitionRow>`
          select
            d.*,
            l.term_display as term
          from definitions d
          inner join lemmas l on l.id = d.lemma_id
          where d.id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: Connection,
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

  allByLemma(db: Connection, lemmaId: LemmaId): Promise<DefinitionRow[]> {
    return db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId,
      (db, lemmaIds) =>
        db.all<DefinitionRow>`
          select
            d.*,
            l.term_display as term
          from definitions d
          inner join lemmas l on l.id = d.lemma_id
          where d.lemma_id in (${lemmaIds})
          order by d.id
        `,
      row => row.lemma_id
    );
  },

  anyUsesInflectionTableCond(db: Connection, condition: any): boolean {
    const {used} = db.getRequired<{used: number}>`
      select exists (
        select 1
        from definition_inflection_tables
        where ${condition}
      ) as used
    `;
    return used === 1;
  },

  anyUsesInflectionTable(db: Connection, tableId: InflectionTableId): boolean {
    return this.anyUsesInflectionTableCond(
      db,
      db.raw`inflection_table_id = ${tableId}`
    );
  },

  anyUsesInflectionTableLayout(
    db: Connection,
    versionId: InflectionTableLayoutId
  ): boolean {
    return this.anyUsesInflectionTableCond(
      db,
      db.raw`inflection_table_version_id = ${versionId}`
    );
  },

  allByInflectionTableCond(
    db: Connection,
    condition: any,
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
          l.term_display as term
        from definition_inflection_tables dit
        inner join definitions d on d.id = dit.definition_id
        inner join lemmas l on l.id = d.lemma_id
        where ${condition}
        group by d.id
        order by l.term_display, d.id
        limit ${limit} offset ${offset}
      `,
      info
    );
  },

  allByInflectionTable(
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
          l.term_display as term
        from definitions d
        inner join lemmas l on l.id = d.lemma_id
        where ${condition}
        order by l.term_display, d.id
        limit ${limit} offset ${offset}
      `,
      info
    );
  },
} as const;

const DefinitionDescription = {
  rawByDefinitionKey: 'DefinitionDescription.rawByDefinition',

  rawByDefinition(db: Connection, definitionId: DefinitionId): Promise<string> {
    return db
      .batchOneToOne(
        this.rawByDefinitionKey,
        definitionId,
        (db, definitionIds) =>
          db.all<DefinitionDescriptionRow>`
            select *
            from definition_descriptions
            where definition_id in (${definitionIds})
          `,
        row => row.definition_id
      )
      // The string 'null' is a valid JSON value. In theory we should never
      // find any null values here, but I guess being defensive doesn't hurt.
      .then(row => row ? row.description : 'null');
  },
} as const;

const DefinitionStem = {
  allByDefinitionKey: 'DefinitionStem.allByDefinition',

  allByDefinition(
    db: Connection,
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
          order by definition_id, name
        `,
      row => row.definition_id
    );
  },
} as const;

const DefinitionInflectionTable = {
  byIdKey: 'DefinitionInflectionTable.byId',
  allByDefinitionKey: 'DefinitionInflectionTable.allByDefinition',

  byId(
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
    lemmaId: LemmaId
  ): Promise<DerivedDefinitionRow[]> {
    return db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId,
      (db, lemmaIds) =>
        db.all<DerivedDefinitionRow>`
          select
            dd.*,
            l.term_display as term,
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
    db: Connection,
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
          l.term_display as term,
          l.language_id
        from derived_definitions dd
        inner join lemmas l on l.id = dd.lemma_id
        where ${condition}
        order by l.term_display, dd.inflected_form_id
        limit ${limit} offset ${offset}
      `,
      info
    );
  },
} as const;

export {
  Definition,
  DefinitionDescription,
  DefinitionStem,
  DefinitionInflectionTable,
  CustomInflectedForm,
  DerivedDefinition,
};
