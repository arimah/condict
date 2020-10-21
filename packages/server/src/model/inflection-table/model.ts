import {UserInputError} from 'apollo-server';
import {GraphQLResolveInfo} from 'graphql';

import {Connection} from '../../database';
import {
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  PageParams,
  validatePageParams,
} from '../../graphql';

import paginate from '../paginate';
import {ItemConnection} from '../types';

import {
  InflectionTableRow,
  InflectionTableLayoutRow,
  InflectedFormRow,
} from './types';

const InflectionTable = {
  byIdKey: 'InflectionTable.byId',
  allByPartOfSpeechKey: 'InflectionTable.allByPartOfSpeechKey',

  byId(
    db: Connection,
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
    db: Connection,
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

  allByPartOfSpeech(
    db: Connection,
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
} as const;

const InflectedForm = {
  byIdKey: 'InflectedForm.byId',
  allByTableLayoutKey: 'InflectedForm.allByTableLayout',

  byId(db: Connection, id: InflectedFormId): Promise<InflectedFormRow | null> {
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
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
    db: Connection,
    tableId: InflectionTableId,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<InflectionTableLayoutRow> {
    const condition = db.raw`
      itv.inflection_table_id = ${tableId} and is_current = 0
    `;
    return paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
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
