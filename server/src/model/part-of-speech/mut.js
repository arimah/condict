const {UserInputError} = require('apollo-server');

const Mutator = require('../mutator');
const validator = require('../validator');

const nameValidator = (db, currentId, languageId) =>
  validator('name')
    .map(value => value.trim())
    .lengthBetween(1, 96)
    .unique(
      currentId,
      name =>
        db.get`
          select id
          from parts_of_speech
          where name = ${name}
            and language_id = ${languageId}
        `,
      name => `the language already has a part of speech named '${name}'`
    );

const ensurePartOfSpeechIsUnused = async (db, id) => {
  const {used} = await db.get`
    select exists (
      select 1
      from definitions
      where part_of_speech_id = ${id | 0}
      limit 1
    ) as used
  `;
  if (used) {
    throw new UserInputError(
      `Part of speech ${id} cannot be deleted because it is used by one or more lemmas`
    );
  }
};

class PartOfSpeechMut extends Mutator {
  async insert({languageId, name}) {
    const {db} = this;
    const {PartOfSpeech, Language} = this.model;

    const language = await Language.byId(languageId);
    if (!language) {
      throw new UserInputError(`No language with ID ${languageId}`, {
        invalidArgs: ['languageId']
      });
    }

    name = await nameValidator(db, null, language.id).validate(name);

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
        await nameValidator(
          db,
          partOfSpeech.id,
          partOfSpeech.language_id
        ).validate(name);

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
