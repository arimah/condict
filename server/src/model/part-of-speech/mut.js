const Mutator = require('../mutator');

const {validateName} = require('./validators');
const ensurePartOfSpeechIsUnused = require('./ensure-unused');

class PartOfSpeechMut extends Mutator {
  async insert({languageId, name}) {
    const {db} = this;
    const {PartOfSpeech, Language} = this.model;

    const language = await Language.byIdRequired(languageId);

    name = await validateName(db, null, language.id, name);

    const {insertId} = await db.exec`
      insert into parts_of_speech (language_id, name)
      values (${language.id}, ${name})
    `;
    return PartOfSpeech.byId(insertId);
  }

  async update(id, {name}) {
    const {db} = this;
    const {PartOfSpeech} = this.model;

    const partOfSpeech = await PartOfSpeech.byIdRequired(id);

    if (name != null) {
      const newName =
        await validateName(
          db,
          partOfSpeech.id,
          partOfSpeech.language_id,
          name
        );

      await db.exec`
        update parts_of_speech
        set name = ${newName}
        where id = ${partOfSpeech.id}
      `;
      db.clearCache(PartOfSpeech.byIdKey, partOfSpeech.id);
    }

    return PartOfSpeech.byId(id);
  }

  async delete(id) {
    const {db} = this;

    await ensurePartOfSpeechIsUnused(db, id);

    const {affectedRows} = await db.exec`
      delete from parts_of_speech
      where id = ${id | 0}
    `;
    return affectedRows > 0;
  }
}

module.exports = {
  PartOfSpeechMut,
};
