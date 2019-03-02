const validator = require('../validator');
const sizeOfColumn = require('../size-of-column');

const TermSize = sizeOfColumn('lemmas', 'term_unique');

const validateTerm =
  validator('term')
    .map(value => value.trim())
    .lengthBetween(1, TermSize)
    .validate;

module.exports = {
  validateTerm,
};
