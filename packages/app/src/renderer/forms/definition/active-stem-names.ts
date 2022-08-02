import {useMemo} from 'react';

import {Form, useFormValue} from '../../form';
import {PartOfSpeechId, InflectionTableId} from '../../graphql';

import NeutralCollator from './neutral-collator';
import {DefinitionTableFormData, PartOfSpeechFields} from './types';

const useActiveStemNames = (
  form: Form<any>,
  partsOfSpeech: readonly PartOfSpeechFields[]
): string[] => {
  const partOfSpeechId = useFormValue<PartOfSpeechId | null>(
    form,
    'partOfSpeech'
  );
  const inflectionTables = useFormValue<DefinitionTableFormData[]>(
    form,
    'inflectionTables'
  );

  const availableTables = useMemo(() => {
    const pos = partsOfSpeech.find(p => p.id === partOfSpeechId);
    if (!pos) {
      return new Set<InflectionTableId>();
    }
    return new Set(pos.inflectionTables.map(t => t.id));
  }, [partsOfSpeech, partOfSpeechId]);

  return useMemo(() => {
    // Clear this so we can rebuild it below.
    if (partOfSpeechId == null) {
      return [];
    }

    const active: string[] = [];

    const seen = new Set<string>();
    for (const table of inflectionTables) {
      if (!availableTables.has(table.tableId)) {
        // The table belongs to a different part of speech; ignore it.
        continue;
      }
      for (const name of table.stems) {
        if (!seen.has(name)) {
          active.push(name);
          seen.add(name);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    active.sort(NeutralCollator.compare);
    return active;
  }, [availableTables, inflectionTables]);
};

export default useActiveStemNames;
