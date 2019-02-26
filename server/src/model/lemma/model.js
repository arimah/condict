const {validatePageParams, createConnection} = require('../../schema/helpers');

const Model = require('../model');

class Lemma extends Model {
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol('Lemma.byId');
    this.defaultPagination = Object.freeze({
      page: 0,
      perPage: 50,
    });
    this.maxPerPage = 200;
  }

  byId(id) {
    return this.db.batchOneToOne(
      this.byIdKey,
      id | 0,
      (db, ids) =>
        db.all`
          select *
          from lemmas
          where id in (${ids})
        `
    );
  }

  byTerm(languageId, term) {
    return this.db.batchOneToOne(
      this.byTermKey(languageId),
      term,
      (db, terms, languageId) =>
        db.all`
          select *
          from lemmas
          where language_id = ${languageId}
            and term_unique in (${terms})
        `,
      row => row.term_unique,
      languageId | 0
    );
  }

  byTermKey(languageId) {
    return `lemmas.term_unique-${languageId}`;
  }

  async allByLanguage(languageId, page, filter) {
    page = validatePageParams(page || this.defaultPagination, this.maxPerPage);

    // The pagination parameters make batching difficult and probably unnecessary.
    const offset = page.page * page.perPage;
    const {db} = this;
    const condition = db.raw`
      l.language_id = ${languageId | 0}
        ${
          filter === 'DEFINED_LEMMAS_ONLY' ? db.raw`
            and exists (
              select 1
              from definitions d
              where d.lemma_id = l.id
            )` :
          filter === 'DERIVED_LEMMAS_ONLY' ? db.raw`
            and exists (
              select 1
              from derived_definitions dd
              where dd.lemma_id = l.id
            )` :
          db.raw``
        }
    `;
    const {total: totalCount} = await db.get`
      select count(*) as total
      from lemmas l
      where ${condition}
    `;
    const nodes = await db.all`
      select l.*
      from lemmas l
      where ${condition}
      order by l.term_display
      limit ${page.perPage} offset ${offset}
    `;
    return createConnection(page, totalCount, nodes);
  }
}

module.exports = {
  Lemma,
};
