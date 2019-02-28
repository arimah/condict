const {UserInputError} = require('apollo-server');

const Model = require('../model');

class PartOfSpeech extends Model {
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol('PartOfSpeech.byId');
    this.allByLanguageKey = Symbol('PartOfSpeech.allByLanguage');
  }

  byId(id) {
    return this.db.batchOneToOne(
      this.byIdKey,
      id | 0,
      (db, ids) =>
        db.all`
          select *
          from parts_of_speech
          where id in (${ids})
        `
    );
  }

  async byIdRequired(id, paramName = 'id') {
    const partOfSpeech = await this.byId(id);
    if (!partOfSpeech) {
      throw new UserInputError(`Part of speech not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return partOfSpeech;
  }

  allByLanguage(languageId) {
    return this.db.batchOneToMany(
      this.allByLanguageKey,
      languageId | 0,
      (db, languageIds) =>
        db.all`
          select *
          from parts_of_speech
          where language_id in (${languageIds})
          order by name
        `,
      row => row.language_id
    );
  }
}

module.exports = {
  PartOfSpeech,
};
