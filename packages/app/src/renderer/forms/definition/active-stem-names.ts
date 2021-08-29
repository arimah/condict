import {useMemo} from 'react';
import {useWatch} from 'react-hook-form';

import {PartOfSpeechId, InflectionTableId} from '../../graphql';

import NeutralCollator from './neutral-collator';
import {DefinitionTableData, PartOfSpeechFields} from './types';

const useActiveStemNames = (
  partsOfSpeech: readonly PartOfSpeechFields[]
): string[] => {
  const partOfSpeechId = useWatch({
    name: 'partOfSpeech',
  }) as PartOfSpeechId | null;
  const inflectionTables = useWatch({
    name: 'inflectionTables',
  }) as DefinitionTableData[];

  const availableTables = useMemo(() => {
    const pos = partsOfSpeech.find(p => p.id === partOfSpeechId);
    if (!pos) {
      return new Map<InflectionTableId, readonly string[]>();
    }
    return new Map(pos.inflectionTables.map(t => [t.id, t.layout.stems]));
  }, [partsOfSpeech, partOfSpeechId]);

  return useMemo(() => {
    // Clear this so we can rebuild it below.
    if (partOfSpeechId == null) {
      return [];
    }

    const active: string[] = [];

    const seen = new Set<string>();
    for (const table of inflectionTables) {
      const tableStems = availableTables.get(table.tableId);
      if (!tableStems) {
        // The table belongs to a different part of speech; ignore it.
        continue;
      }

      for (const name of tableStems) {
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
