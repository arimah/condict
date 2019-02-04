const {UserInputError} = require('apollo-server');

const Model = require('../model');
const {createConnection} = require('../../schema/helpers');

const DefaultPagination = Object.freeze({
  page: 0,
  perPage: 50,
});
const MaxPerPage = 200;

class Lemma extends Model {
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol();
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
    page = page || DefaultPagination;

    if (page.page < 0) {
      throw new UserInputError(`Page number must be greater than zero; got ${page.page}`, {
        invalidArgs: ['page']
      });
    }
    if (page.perPage < 1 || page.perPage > MaxPerPage) {
      throw new UserInputError(`perPage must be between 1 and ${MaxPerPage}; got ${page.perPage}`, {
        invalidArgs: ['page']
      });
    }

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
