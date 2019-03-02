const validator = require('../validator');
const sizeOfColumn = require('../size-of-column');

const NameSize = sizeOfColumn('languages', 'name');
const UrlNameSize = sizeOfColumn('languages', 'url_name');

const validateName = (db, currentId, value) =>
  validator('name')
    .map(value => value.trim())
    .lengthBetween(1, NameSize)
    .unique(currentId, name =>
      db.get`
        select id
        from languages
        where name = ${name}
      `
    )
    .validate(value);

const validateUrlName = (db, currentId, value) =>
  validator('urlName')
    .map(value => value.toLowerCase().trim())
    .lengthBetween(1, UrlNameSize)
    .matches(/^[a-z0-9-]+$/, () => 'can only contain a-z, 0-9 and -')
    .unique(currentId, urlName =>
      db.get`
        select id
        from languages
        where url_name = ${urlName}
      `
    )
    .validate(value);

module.exports = {
  validateName,
  validateUrlName,
};
