const {UserInputError} = require('apollo-server');

const Model = require('../model');

class Language extends Model {
  constructor(db, model) {
    super(db, model);

    this.byIdKey = Symbol('Language.byId');
  }

  all() {
    return this.db.all`
      select *
      from languages
      order by name
    `;
  }

  byId(id) {
    return this.db.batchOneToOne(
      this.byIdKey,
      id | 0,
      (db, ids) => db.all`
        select *
        from languages
        where id in (${ids})
      `
    );
  }

  async byIdRequired(id, paramName = 'id') {
    const language = await this.byId(id);
    if (!language) {
      throw new UserInputError(`Language not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return language;
  }

  byName(name) {
    return this.db.get`
      select *
      from languages
      where name = ${name}
    `;
  }

  byUrlName(urlName) {
    return this.db.get`
      select *
      from languages
      where url_name = ${urlName}
    `;
  }
}

module.exports = {
  Language,
};
