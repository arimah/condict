import {DefinitionTable} from '@condict/table-editor';

import {InflectedFormId} from '../../graphql';

import {InflectionTableLayoutFields} from './types';

const upgradeLayout = (
  prevValue: DefinitionTable,
  nextLayout: InflectionTableLayoutFields
): DefinitionTable => {
  // When we upgrade the table, try to retain existing custom forms as far as
  // possible. The new layout is guaranteed to have all new inflected form IDs,
  // so we match by inflected form name.

  // Collect the previous custom forms, grouped by name.
  const prevCustomForms = new Map<string, string | null>();
  let transferableForms = 0;
  for (const data of prevValue.cellData.values()) {
    if (data.displayName !== null && data.customForm !== null) {
      const currentValue = prevCustomForms.get(data.displayName);
      if (currentValue === undefined) {
        prevCustomForms.set(data.displayName, data.customForm);
        transferableForms += 1;
      } else if (currentValue !== null) {
        // If a name occurs multiple times, we can't possibly know which form is
        // which in the new table.
        prevCustomForms.set(data.displayName, null);
        transferableForms -= 1;
      }
    }
  }

  // Build a mapping from form name to (new) inflected form ID.
  const newCustomForms = new Map<InflectedFormId, string>();

  // Don't bother walking the table if there are no custom forms to begin with.
  if (transferableForms !== 0) {
    for (const row of nextLayout.rows) {
      for (const cell of row.cells) {
        const form = cell.inflectedForm;
        if (!form) {
          continue;
        }

        // If a name occurs multiple times in the *new* table, then we fill
        // in *all* the cells with the same custom form. This is likely to be
        // wrong, but we can't just pick one at random, and it's easy enough
        // to revert.
        const customForm = prevCustomForms.get(form.displayName);
        if (customForm != null) {
          newCustomForms.set(form.id as InflectedFormId, customForm);
        }
      }
    }
  }

  return DefinitionTable.fromJson(
    nextLayout.rows,
    newCustomForms
  );
};

export default upgradeLayout;
