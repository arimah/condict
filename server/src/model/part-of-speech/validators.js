const validator = require('../validator');
const sizeOfColumn = require('../size-of-column');

const NameSize = sizeOfColumn('parts_of_speech', 'name');

const validateName = (db, currentId, languageId, value) =>
  validator('name')
    .map(value => value.trim())
    .lengthBetween(1, NameSize)
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
    )
    .validate(value);

module.exports = {
  validateName,
};
