const Model = require('../model');

class InflectionTable extends Model {
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol();
    this.allByPartOfSpeechKey = Symbol();
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

    this.byIdKey = Symbol();
    this.allByTableKey = Symbol();
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

    this.rawByTableKey = Symbol();
  }

  // This model is a bit unusual in that it returns the value of a single
  // column. I found this to be the least painful way of doing it.
  rawByTable(tableId) {
    return this.db
      .batchOneToOne(
        this.rawByTableKey,
        tableId | 0,
        (db, tableIds) =>
          db.all`
            select *
            from inflection_table_layouts
            where inflection_table_id in (${tableIds})
          `,
        row => row.inflection_table_id
      )
      .then(row => row.layout);
  }
}

module.exports = {
  InflectionTable,
  InflectedForm,
  InflectionTableLayout,
};
