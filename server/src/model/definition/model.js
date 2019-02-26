const {validatePageParams, createConnection} = require('../../schema/helpers');

const Model = require('../model');

class Definition extends Model {
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol('Definition.byId');
    this.allByLemmaKey = Symbol('Definition.allByLemma');
  }

  byId(id) {
    return this.db.batchOneToOne(
      this.byIdKey,
      id | 0,
      (db, ids) =>
        db.all`
          select
            d.*,
            l.term_display as term
          from definitions d
          inner join lemmas l on l.id = d.lemma_id
          where d.id in (${ids})
        `
    );
  }

  allByLemma(lemmaId) {
    return this.db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId | 0,
      (db, lemmaIds) =>
        db.all`
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
  }
}

class DefinitionDescription extends Model {
  constructor(db, model) {
    super(db, model);

    this.rawByDefinitionKey = Symbol('DefinitionDescription.rawByDefinition');
  }

  // This model is a bit unusual in that it returns the value of a single
  // column. I found this to be the least painful way of doing it.
  rawByDefinition(definitionId) {
    return this.db
      .batchOneToOne(
        this.rawByDefinitionKey,
        definitionId | 0,
        (db, definitionIds) =>
          db.all`
            select *
            from definition_descriptions
            where definition_id in (${definitionIds})
          `,
        row => row.definition_id
      )
      .then(row => row.description);
  }
}

class DefinitionStem extends Model {
  constructor(db, model) {
    super(db, model);

    this.allByDefinitionKey = Symbol('DefinitionStem.allByDefinition');
  }

  allByDefinition(definitionId) {
    return this.db.batchOneToMany(
      this.allByDefinitionKey,
      definitionId | 0,
      (db, definitionIds) =>
        db.all`
          select *
          from definition_stems
          where definition_id in (${definitionIds})
          order by value
        `,
      row => row.definition_id
    );
  }
}

class DefinitionInflectionTable extends Model {
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol('DefinitionInflectionTable.byId');
    this.allByDefinitionKey = Symbol('DefinitionInflectionTable.allByDefinition');
  }

  byId(id) {
    return this.db.batchOneToOne(
      this.byIdKey,
      id | 0,
      (db, ids) =>
        db.all`
          select *
          from definition_inflection_tables
          where id in (${ids})
        `
    );
  }

  allByDefinition(definitionId) {
    return this.db.batchOneToMany(
      this.allByDefinitionKey,
      definitionId | 0,
      (db, definitionIds) =>
        db.all`
          select *
          from definition_inflection_tables
          where definition_id in (${definitionIds})
          order by definition_id, sort_order
        `,
      row => row.definition_id
    );
  }
}

class CustomInflectedForm extends Model {
  constructor(db, model) {
    super(db, model);

    this.allByTableKey = Symbol('CustomInflectedForm.allByTable');
  }

  allByTable(tableId) {
    return this.db.batchOneToMany(
      this.allByTableKey,
      tableId | 0,
      (db, tableIds) =>
        db.all`
          select *
          from definition_forms
          where definition_inflection_table_id in (${tableIds})
          order by definition_inflection_table_id, inflected_form_id
        `,
      row => row.definition_inflection_table_id
    );
  }
}

class DerivedDefinition extends Model {
  constructor(db, model) {
    super(db, model);

    this.allByLemmaKey = Symbol('DerivedDefinition.allByLemma');
    this.defaultPagination = Object.freeze({
      page: 0,
      perPage: 50,
    });
    this.maxPerPage = 200;
  }

  allByLemma(lemmaId) {
    return this.db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId | 0,
      (db, lemmaIds) =>
        db.all`
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
  }

  async allByDerivedFrom(definitionId, page) {
    page = validatePageParams(page || this.defaultPagination, this.maxPerPage);

    // The pagination parameters make batching difficult and probably unnecessary.
    const offset = page.page * page.perPage;
    const {db} = this;
    const condition = db.raw`
      dd.original_definition_id = ${definitionId | 0}
    `;
    const {total: totalCount} = await db.get`
      select count(*) as total
      from derived_definitions dd
      where ${condition}
    `;
    const nodes = await db.all`
      select
        dd.*,
        l.term_display as term,
        l.language_id
      from derived_definitions dd
      inner join lemmas l on l.id = dd.lemma_id
      where ${condition}
      order by l.term_display, dd.inflected_form_id
      limit ${page.perPage} offset ${offset}
    `;
    return createConnection(page, totalCount, nodes);
  }
}

module.exports = {
  Definition,
  DefinitionDescription,
  DefinitionStem,
  DefinitionInflectionTable,
  CustomInflectedForm,
  DerivedDefinition,
};
