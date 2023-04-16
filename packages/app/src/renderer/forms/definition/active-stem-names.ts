import {useMemo} from 'react';

import {Form, useFormValue} from '../../form';

import NeutralCollator from './neutral-collator';
import {DefinitionTableFormData} from './types';

const useActiveStemNames = (form: Form<any>): string[] => {
  const inflectionTables = useFormValue<DefinitionTableFormData[]>(
    form,
    'inflectionTables'
  );

  return useMemo(() => {
    const active: string[] = [];

    const seen = new Set<string>();
    for (const table of inflectionTables) {
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
  }, [inflectionTables]);
};

export default useActiveStemNames;
