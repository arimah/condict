import inflectWord from '../../utils/inflect-word';

import {InflectedFormRow} from '../inflection-table/model';

const deriveForms = (
  term: string,
  stems: Map<string, string>,
  derivableForms: InflectedFormRow[]
) => {
  // Mapping from inflected form ID to term.
  const derivedForms = new Map<number, string>();

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

export default deriveForms;
