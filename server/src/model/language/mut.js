const Mutator = require('../mutator');
const validator = require('../validator');
const FieldSet = require('../field-set');

const nameValidator = (db, currentId) =>
  validator('name')
    .map(value => value.trim())
    .lengthBetween(1, 96)
    .unique(currentId, name =>
      db.get`
        select id
        from languages
        where name = ${name}
      `
    );

const urlNameValidator = (db, currentId) =>
  validator('urlName')
    .map(value => value.toLowerCase().trim())
    .lengthBetween(1, 32)
    .matches(/^[a-z0-9-]+$/, () => 'can only contain a-z, 0-9 and -')
    .unique(currentId, urlName =>
      db.get`
        select id
        from languages
        where url_name = ${urlName}
      `
    );

class LanguageMut extends Mutator {
  async insert({name, urlName}) {
    const {db} = this;
    const {Language} = this.model;

    name = await nameValidator(db, null).validate(name);
    urlName = await urlNameValidator(db, null).validate(urlName);

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
        await nameValidator(db, language.id).validate(name)
      );
    }

    if (urlName != null) {
      newFields.set(
        'url_name',
        await urlNameValidator(db, language.id).validate(urlName)
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
