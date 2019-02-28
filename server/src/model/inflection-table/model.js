const {UserInputError} = require('apollo-server');

const Model = require('../model');

class InflectionTable extends Model {
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol('InflectionTable.byId');
    this.allByPartOfSpeechKey = Symbol('InflectionTable.allByPartOfSpeech');
  }

  byId(id) {
    return this.db.batchOneToOne(
      this.byIdKey,
      id | 0,
      (db, ids) =>
        db.all`
          select *
          from inflection_tables
          where id in (${ids})
        `
    );
  }

  async byIdRequired(id, paramName = 'id') {
    const inflectionTable = await this.byId(id);
    if (!inflectionTable) {
      throw new UserInputError(`Inflection table not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return inflectionTable;
  }

  allByPartOfSpeech(partOfSpeechId) {
    return this.db.batchOneToMany(
      this.allByPartOfSpeechKey,
      partOfSpeechId | 0,
      (db, partOfSpeechIds) =>
        db.all`
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
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol('InflectedForm.byId');
    this.allByTableKey = Symbol('InflectedForm.allByTable');
  }

  byId(id) {
    return this.db.batchOneToOne(
      this.byIdKey,
      id | 0,
      (db, ids) =>
        db.all`
          select *
          from inflected_forms
          where id in (${ids})
        `
    );
  }

  async byIdRequired(id, paramName = 'id') {
    const inflectedForm = await this.byId(id);
    if (!inflectedForm) {
      throw new UserInputError(`Inflected form not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return inflectedForm;
  }

  allByTable(tableId) {
    return this.db.batchOneToMany(
      this.allByTableKey,
      tableId | 0,
      (db, tableIds) =>
        db.all`
          select *
          from inflected_forms
          where inflection_table_id in (${tableIds})
          order by inflection_table_id, id
        `,
      row => row.inflection_table_id
    );
  }

  allDerivableByTable(tableId) {
    return this.db.all`
      select i.*
      from inflected_forms i
      inner join inflection_tables t on t.id = i.inflection_table_id
      where i.inflection_table_id = ${tableId}
        and i.derive_lemma = 1
    `;
  }
}

class InflectionTableLayout extends Model {
  constructor(db, model) {
    super(db, model);

    this.byTableKey = Symbol('InflectionTableLayout.byTable');
  }

  byTable(tableId) {
    return this.db.batchOneToOne(
      this.byTableKey,
      tableId | 0,
      (db, tableIds) =>
        db.all`
          select *
          from inflection_table_layouts
          where inflection_table_id in (${tableIds})
        `,
      row => row.inflection_table_id
    );
  }
}

module.exports = {
  InflectionTable,
  InflectedForm,
  InflectionTableLayout,
};
