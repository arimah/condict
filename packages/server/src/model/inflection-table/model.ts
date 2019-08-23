import {UserInputError} from 'apollo-server';

import {Awaitable} from '../../database/adaptor';
import {validatePageParams} from '../../graphql/helpers';
import {
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  PageParams,
} from '../../graphql/types';
import {Connection} from '../../graphql/resolvers/types';

import Model from '../model';

import {
  InflectionTableRow,
  InflectionTableLayoutRow,
  InflectedFormRow,
} from './types';

class InflectionTable extends Model {
  public readonly byIdKey = 'InflectionTable.byId';
  public readonly allByPartOfSpeechKey = 'InflectionTable.allByPartOfSpeechKey';

  public byId(id: InflectionTableId): Promise<InflectionTableRow | null> {
    return this.db.batchOneToOne(
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
  }

  public async byIdRequired(
    id: InflectionTableId,
    paramName: string = 'id'
  ): Promise<InflectionTableRow> {
    const inflectionTable = await this.byId(id);
    if (!inflectionTable) {
      throw new UserInputError(`Inflection table not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return inflectionTable;
  }

  public allByPartOfSpeech(
    partOfSpeechId: PartOfSpeechId
  ): Promise<InflectionTableRow[]> {
    return this.db.batchOneToMany(
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
  }
}

class InflectedForm extends Model {
  public readonly byIdKey = 'InflectedForm.byId';
  public readonly allByTableLayoutKey = 'InflectedForm.allByTableLayout';

  public byId(id: InflectedFormId): Promise<InflectedFormRow | null> {
    return this.db.batchOneToOne(
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
  }

  public async byIdRequired(
    id: InflectedFormId,
    paramName: string = 'id'
  ): Promise<InflectedFormRow> {
    const inflectedForm = await this.byId(id);
    if (!inflectedForm) {
      throw new UserInputError(`Inflected form not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return inflectedForm;
  }

  public allByTableLayout(
    versionId: InflectionTableLayoutId
  ): Promise<InflectedFormRow[]> {
    return this.db.batchOneToMany(
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
  }

  public allDerivableByTableLayout(
    versionId: InflectionTableLayoutId
  ): Awaitable<InflectedFormRow[]> {
    return this.db.all<InflectedFormRow>`
      select *
      from inflected_forms
      where inflection_table_version_id = ${versionId}
        and derive_lemma = 1
    `;
  }
}

class InflectionTableLayout extends Model {
  public readonly byIdKey = 'InflectionTableLayout.byId';
  public readonly currentByTableKey = 'InflectionTableLayout.currentByTable';
  public readonly defaultPagination: Readonly<PageParams> = {
    page: 0,
    perPage: 50,
  };
  public readonly maxPerPage = 200;

  public byId(
    id: InflectionTableLayoutId
  ): Promise<InflectionTableLayoutRow | null> {
    return this.db.batchOneToOne(
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
  }

  public async byIdRequired(
    id: InflectionTableLayoutId,
    paramName: string = 'id'
  ): Promise<InflectionTableLayoutRow> {
    const layout = await this.byId(id);
    if (!layout) {
      throw new UserInputError(`Inflection table layout not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return layout;
  }

  public currentByTable(
    tableId: InflectionTableId
  ): Promise<InflectionTableLayoutRow | null> {
    return this.db.batchOneToOne(
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
  }

  public async currentByTableRequired(
    tableId: InflectionTableId,
    paramName: string = 'tableId'
  ): Promise<InflectionTableLayoutRow> {
    const layout = await this.currentByTable(tableId);
    if (!layout) {
      throw new UserInputError(`Table has no current layout: ${tableId}`, {
        invalidArgs: [paramName],
      });
    }
    return layout;
  }

  public allOldByTable(
    tableId: InflectionTableId,
    page?: PageParams | null
  ): Promise<Connection<InflectionTableLayoutRow>> {
    const condition = this.db.raw`
      itv.inflection_table_id = ${tableId} and is_current = 0
    `;
    return this.db.paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      async db => {
        const {total} = await db.getRequired<{total: number}>`
          select count(*) as total
          from inflection_table_versions itv
          where ${condition}
        `;
        return total;
      },
      (db, limit, offset) => db.all<InflectionTableLayoutRow>`
        select
          itv.*,
          itl.*
        from inflection_table_versions itv
        inner join inflection_table_layouts itl on
          itl.inflection_table_version_id = itv.id
        where ${condition}
        order by itv.id desc
        limit ${limit} offset ${offset}
      `
    );
  }
}

export default {
  InflectionTable,
  InflectedForm,
  InflectionTableLayout,
};
