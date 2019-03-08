import {UserInputError} from 'apollo-server';

import Model from '../model';

export interface InflectionTableRow {
  id: number;
  part_of_speech_id: number;
  name: string;
}

export interface InflectedFormRow {
  id: number;
  inflection_table_id: number;
  /** Boolean */
  derive_lemma: number;
  /** Boolean */
  custom_display_name: number;
  inflection_pattern: string;
  display_name: string;
}

export interface InflectionTableLayoutRow {
  inflection_table_id: number;
  /** JSON-serialized data */
  layout: string;
  /** JSON-serialized data */
  stems: string;
}

class InflectionTable extends Model {
  public readonly byIdKey = 'InflectionTable.byId';
  public readonly allByPartOfSpeechKey = 'InflectionTable.allByPartOfSpeechKey';

  public byId(id: number) {
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

  public async byIdRequired(id: number, paramName: string = 'id') {
    const inflectionTable = await this.byId(id);
    if (!inflectionTable) {
      throw new UserInputError(`Inflection table not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return inflectionTable;
  }

  public allByPartOfSpeech(partOfSpeechId: number) {
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
  public readonly allByTableKey = 'InflectedForm.allByTable';

  public byId(id: number) {
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

  public async byIdRequired(id: number, paramName: string = 'id') {
    const inflectedForm = await this.byId(id);
    if (!inflectedForm) {
      throw new UserInputError(`Inflected form not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return inflectedForm;
  }

  public allByTable(tableId: number) {
    return this.db.batchOneToMany(
      this.allByTableKey,
      tableId,
      (db, tableIds) =>
        db.all<InflectedFormRow>`
          select *
          from inflected_forms
          where inflection_table_id in (${tableIds})
          order by inflection_table_id, id
        `,
      row => row.inflection_table_id
    );
  }

  public allDerivableByTable(tableId: number) {
    return this.db.all<InflectedFormRow>`
      select i.*
      from inflected_forms i
      inner join inflection_tables t on t.id = i.inflection_table_id
      where i.inflection_table_id = ${tableId}
        and i.derive_lemma = 1
    `;
  }
}

class InflectionTableLayout extends Model {
  public readonly byTableKey = 'InflectionTableLayout.byTable';

  public byTable(tableId: number) {
    return this.db.batchOneToOne(
      this.byTableKey,
      tableId,
      (db, tableIds) =>
        db.all<InflectionTableLayoutRow>`
          select *
          from inflection_table_layouts
          where inflection_table_id in (${tableIds})
        `,
      row => row.inflection_table_id
    );
  }
}

export default {
  InflectionTable,
  InflectedForm,
  InflectionTableLayout,
};
