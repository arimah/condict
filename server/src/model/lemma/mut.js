const Mutator = require('../mutator');
const validator = require('../validator');

const termValidator =
  validator('term')
    .map(value => value.trim())
    .lengthBetween(1, 160);

class LemmaMut extends Mutator {
  async ensureExists(languageId, term) {
    const {db} = this;

    term = termValidator.validate(term);

    const result = await db.get`
      select id
      from lemmas
      where language_id = ${languageId}
        and term_unique = ${term}
    `;
    if (result) {
      return result.id;
    }

    const {insertId} = await db.exec`
      insert into lemmas (language_id, term_unique, term_display)
      values (${languageId}, ${term}, ${term})
    `;
    await this.updateLemmaCount(languageId);
    return insertId;
  }

  async deleteEmpty(languageId) {
    const {db} = this;
    const {Lemma} = this.model;

    const emptyIds = await db.all`
      select l.id as id
      from lemmas l
      left join definitions d on d.lemma_id = l.id
      left join derived_definitions dd on dd.lemma_id = l.id
      where l.language_id = ${languageId}
        and d.id is null
        and dd.original_definition_id is null
    `;

    if (emptyIds.length > 0) {
      emptyIds.forEach(row => db.clearCache(Lemma.byIdKey, row.id));

      await db.exec`
        delete from lemmas
        where id in (${emptyIds.map(row => row.id)})
      `;
      await this.updateLemmaCount(languageId);
    }
  }

  updateLemmaCount(languageId) {
    return this.db.exec`
      update languages
      set lemma_count = (
        select count(*)
        from lemmas
        where language_id = ${languageId}
      )
      where id = ${languageId}
    `;
  }
}

module.exports = {
  LemmaMut,
};
