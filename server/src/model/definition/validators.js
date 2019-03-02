const validator = require('../validator');
const sizeOfColumn = require('../size-of-column');

const StemNameSize = sizeOfColumn('definition_stems', 'name');
const StemValueSize = sizeOfColumn('definition_stems', 'value');
const FormValueSize = sizeOfColumn('definition_forms', 'inflected_form');

const validateStemName =
  validator('name')
    .lengthBetween(1, StemNameSize)
    .validate;

const validateStemValue =
  validator('value')
    .lengthBetween(0, StemValueSize)
    .validate;

const validateStems = stems =>
  stems.map(stem => ({
    name: validateStemName(stem.name),
    value: validateStemValue(stem.value),
  }));

const validateFormValue =
  validator('value')
    .lengthBetween(0, FormValueSize)
    .validate;

module.exports = {
  validateStemName,
  validateStemValue,
  validateStems,
  validateFormValue,
};
