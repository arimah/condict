const validator = require('../validator');
const sizeOfColumn = require('../size-of-column');

const TableNameSize = sizeOfColumn('inflection_tables', 'name');
const InflectionPatternSize = sizeOfColumn('inflected_forms', 'inflection_pattern');
const DisplayNameSize = sizeOfColumn('inflected_forms', 'display_name');

const validateName = (db, currentId, partOfSpeechId, value) =>
  validator('name')
    .map(value => value.trim())
    .lengthBetween(1, TableNameSize)
    .unique(
      currentId,
      name =>
        db.get`
          select id
          from inflection_tables
          where name = ${name}
            and part_of_speech_id = ${partOfSpeechId}
        `,
      name => `the part of speech already has a table named '${name}'`
    )
    .validate(value);

const validateFormInflectionPattern =
  validator('inflectionPattern')
    .map(value => value.trim())
    .lengthBetween(0, InflectionPatternSize)
    .validate;

const validateFormDisplayName =
  validator('displayName')
    .map(value => value.trim())
    .lengthBetween(0, DisplayNameSize)
    .validate;

module.exports = {
  validateName,
  validateFormInflectionPattern,
  validateFormDisplayName,
};
