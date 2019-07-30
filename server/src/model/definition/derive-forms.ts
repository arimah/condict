import inflectWord from '../../utils/inflect-word';

import {InflectedFormId, InflectedFormRow} from '../inflection-table/types';

const deriveForms = (
  term: string,
  stems: Map<string, string>,
  derivableForms: InflectedFormRow[]
): Map<InflectedFormId, string> => {
  // Mapping from inflected form ID to term.
  const derivedForms = new Map<InflectedFormId, string>();

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
