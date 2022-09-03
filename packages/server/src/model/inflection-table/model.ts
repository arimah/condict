import {UserInputError} from 'apollo-server';
import {GraphQLResolveInfo} from 'graphql';

import {DataReader} from '../../database';
import {
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  PageParams,
  validatePageParams,
  LayoutVersionFilter,
} from '../../graphql';

import paginate from '../paginate';
import {ItemConnection} from '../types';

import {
  InflectionTableRow,
  InflectionTableLayoutRow,
  InflectedFormRow,
  DefinitionUsingInflectionTableRow,
} from './types';

const InflectionTable = {
  byIdKey: 'InflectionTable.byId',
  allByPartOfSpeechKey: 'InflectionTable.allByPartOfSpeechKey',
  defaultPagination: {
    page: 0,
    perPage: 50,
  },
  maxPerPage: 200,

  byId(
    db: DataReader,
    id: InflectionTableId
  ): Promise<InflectionTableRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<InflectionTableRow>`
          select *
          from inflection_tables
          where id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: InflectionTableId,
    paramName = 'id'
  ): Promise<InflectionTableRow> {
    const inflectionTable = await this.byId(db, id);
    if (!inflectionTable) {
      throw new UserInputError(`Inflection table not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return inflectionTable;
  },

  byName(
    db: DataReader,
    partOfSpeechId: PartOfSpeechId,
    name: string
  ): InflectionTableRow | null {
    return db.get`
      select *
      from inflection_tables
      where part_of_speech_id = ${partOfSpeechId}
        and name = ${name}
    `;
  },

  allByPartOfSpeech(
    db: DataReader,
    partOfSpeechId: PartOfSpeechId
  ): Promise<InflectionTableRow[]> {
    return db.batchOneToMany(
      this.allByPartOfSpeechKey,
      partOfSpeechId,
      (db, partOfSpeechIds) =>
        db.all<InflectionTableRow>`
          select *
          from inflection_tables
          where part_of_speech_id in (${partOfSpeechIds})
          order by part_of_speech_id, name
        `,
      row => row.part_of_speech_id
    );
  },

  usersOfTable(
    db: DataReader,
    tableId: InflectionTableId,
    page: PageParams | undefined | null,
    layout: LayoutVersionFilter,
    info?: GraphQLResolveInfo
  ): ItemConnection<DefinitionUsingInflectionTableRow> {
    const joinCondition = layout !== 'ALL_LAYOUTS'
      ? db.raw`and itv.is_current = ${layout === 'CURRENT_LAYOUT'}`
      : db.raw``;
    return paginate(
      validatePageParams(page ?? this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(distinct dit.definition_id) as total
          from definition_inflection_tables dit
          inner join inflection_table_versions itv on
            itv.id = dit.inflection_table_version_id
            ${joinCondition}
          where dit.inflection_table_id = ${tableId}
        `;
        return total;
      },
      (limit, offset) => db.all<DefinitionUsingInflectionTableRow>`
        select
          dit.definition_id,
          sum(itv.is_current = 0) > 0 as has_old_layouts
        from definition_inflection_tables dit
        inner join definitions d on d.id = dit.definition_id
        inner join lemmas l on l.id = d.lemma_id
        inner join inflection_table_versions itv on
          itv.id = dit.inflection_table_version_id
          ${joinCondition}
        where dit.inflection_table_id = ${tableId}
        group by d.id
        order by l.term, d.id
        limit ${limit} offset ${offset}
      `,
      info
    );
  },
} as const;

const InflectedForm = {
  byIdKey: 'InflectedForm.byId',
  allByTableLayoutKey: 'InflectedForm.allByTableLayout',

  byId(db: DataReader, id: InflectedFormId): Promise<InflectedFormRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<InflectedFormRow>`
          select *
          from inflected_forms
          where id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: InflectedFormId,
    paramName = 'id'
  ): Promise<InflectedFormRow> {
    const inflectedForm = await this.byId(db, id);
    if (!inflectedForm) {
      throw new UserInputError(`Inflected form not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return inflectedForm;
  },

  allByTableLayout(
    db: DataReader,
    versionId: InflectionTableLayoutId
  ): Promise<InflectedFormRow[]> {
    return db.batchOneToMany(
      this.allByTableLayoutKey,
      versionId,
      (db, versionId) =>
        db.all<InflectedFormRow>`
          select *
          from inflected_forms
          where inflection_table_version_id in (${versionId})
          order by inflection_table_version_id, id
        `,
      row => row.inflection_table_version_id
    );
  },

  allDerivableByTableLayout(
    db: DataReader,
    versionId: InflectionTableLayoutId
  ): InflectedFormRow[] {
    return db.all<InflectedFormRow>`
      select *
      from inflected_forms
      where inflection_table_version_id = ${versionId}
        and derive_lemma = 1
    `;
  },
} as const;

const InflectionTableLayout = {
  byIdKey: 'InflectionTableLayout.byId',
  currentByTableKey: 'InflectionTableLayout.currentByTable',
  defaultPagination: {
    page: 0,
    perPage: 50,
  },
  maxPerPage: 200,

  byId(
    db: DataReader,
    id: InflectionTableLayoutId
  ): Promise<InflectionTableLayoutRow | null> {
    return db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<InflectionTableLayoutRow>`
          select
            itv.*,
            itl.*
          from inflection_table_versions itv
          inner join inflection_table_layouts itl on
            itl.inflection_table_version_id = itv.id
          where itv.id in (${ids})
        `,
      row => row.id
    );
  },

  async byIdRequired(
    db: DataReader,
    id: InflectionTableLayoutId,
    paramName = 'id'
  ): Promise<InflectionTableLayoutRow> {
    const layout = await this.byId(db, id);
    if (!layout) {
      throw new UserInputError(`Inflection table layout not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return layout;
  },

  currentByTable(
    db: DataReader,
    tableId: InflectionTableId
  ): Promise<InflectionTableLayoutRow | null> {
    return db.batchOneToOne(
      this.currentByTableKey,
      tableId,
      (db, tableIds) =>
        db.all<InflectionTableLayoutRow>`
          select
            itv.*,
            itl.*
          from inflection_table_versions itv
          inner join inflection_table_layouts itl on
            itl.inflection_table_version_id = itv.id
          where itv.inflection_table_id in (${tableIds})
            and itv.is_current = 1
        `,
      row => row.inflection_table_id
    );
  },

  async currentByTableRequired(
    db: DataReader,
    tableId: InflectionTableId,
    paramName = 'tableId'
  ): Promise<InflectionTableLayoutRow> {
    const layout = await this.currentByTable(db, tableId);
    if (!layout) {
      throw new UserInputError(`Table has no current layout: ${tableId}`, {
        invalidArgs: [paramName],
      });
    }
    return layout;
  },

  allOldByTable(
    db: DataReader,
    tableId: InflectionTableId,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<InflectionTableLayoutRow> {
    const condition = db.raw`
      itv.inflection_table_id = ${tableId} and itv.is_current = 0
    `;
    return paginate(
      validatePageParams(page ?? this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select count(*) as total
          from inflection_table_versions itv
          where ${condition}
        `;
        return total;
      },
      (limit, offset) => db.all<InflectionTableLayoutRow>`
        select
          itv.*,
          itl.*
        from inflection_table_versions itv
        inner join inflection_table_layouts itl on
          itl.inflection_table_version_id = itv.id
        where ${condition}
        order by itv.id desc
        limit ${limit} offset ${offset}
      `,
      info
    );
  },
} as const;

export {
  InflectionTable,
  InflectedForm,
  InflectionTableLayout,
};
