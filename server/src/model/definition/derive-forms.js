const inflectWord = require('../../utils/inflect-word');

module.exports = (term, stems, derivableForms) => {
  // Mapping from inflected form ID to term.
  const derivedForms = new Map();

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
