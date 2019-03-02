const Mutator = require('../mutator');
const FieldSet = require('../field-set');

const {
  validateName,
  validateUrlName,
} = require('./validators');

class LanguageMut extends Mutator {
  async insert({name, urlName}) {
    const {db} = this;
    const {Language} = this.model;

    name = await validateName(db, null, name);
    urlName = await validateUrlName(db, null, urlName);

    const {insertId} = await db.exec`
      insert into languages (name, url_name)
      values (${name}, ${urlName})
    `;
    return Language.byId(insertId);
  }

  async update(id, {name, urlName}) {
    const {db} = this;
    const {Language} = this.model;

    const language = await Language.byIdRequired(id);

    const newFields = new FieldSet();
    if (name != null) {
      newFields.set(
        'name',
        await validateName(db, language.id, name)
      );
    }

    if (urlName != null) {
      newFields.set(
        'url_name',
        await validateUrlName(db, language.id, urlName)
      );
    }

    if (newFields.size > 0) {
      await db.exec`
        update languages
        set ${newFields}
        where id = ${language.id}
      `;
      db.clearCache(Language.byIdKey, language.id);
    }
    return Language.byId(id);
  }
}

module.exports = {
  LanguageMut,
};
