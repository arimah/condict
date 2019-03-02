const inflectWord = require('../../utils/inflect-word');

module.exports = (term, stems, derivableForms) => {
  // Mapping from inflected form ID to term.
  const derivedForms = new Map();

  // Find all the forms contained in the table, and derive forms for them!
  for (const form of derivableForms) {
    const inflectedWord = inflectWord(
      term,
      stems,
      form.inflection_pattern
    );
    derivedForms.set(form.id, inflectedWord);
  }

  return derivedForms;
};
