import {inflectWord} from '@condict/inflect';

import {InflectedFormId} from '../../graphql';

import {InflectedFormRow} from '../inflection-table';

const deriveForms = (
  term: string,
  stems: Map<string, string>,
  derivableForms: InflectedFormRow[]
): Map<InflectedFormId, string> => {
  // Mapping from inflected form ID to term.
  const derivedForms = new Map<InflectedFormId, string>();

  for (const form of derivableForms) {
    const inflectedWord = inflectWord(form.inflection_pattern, term, stems);
    derivedForms.set(form.id, inflectedWord);
  }

  return derivedForms;
};

export default deriveForms;
