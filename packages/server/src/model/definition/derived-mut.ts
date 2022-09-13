import {DataWriter} from '../../database';
import {MultiMap} from '../../utils';
import {DefinitionId, LanguageId, InflectedFormId} from '../../graphql';

import {LemmaMut, ValidTerm, validateTerm} from '../lemma';
import {WriteContext} from '../types';

const DerivedDefinitionMut = {
  insertAll(
    context: WriteContext,
    languageId: LanguageId,
    originalDefinitionId: DefinitionId,
    derivedDefinitions: MultiMap<string, InflectedFormId>
  ): void {
    // validateTerm may normalize the term, for example by trimming away
    // white space. When we insert our derived definitions, we must ensure
    // we use the normalized values, so build a map from validated term
    // to inflected form ID.
    //
    // If validation fails for any given derived definition, we simply
    // ignore it. This can happen if the term is empty (in which case we
    // don't want it in the dictionary anyway). Generally it's preferable
    // to add what we can.

    const validDerivedDefinitions = derivedDefinitions
      .map((term, inflectedFormId) => {
        try {
          const validTerm = validateTerm(term);
          return [validTerm, inflectedFormId];
        } catch (e) {
          // Add invalid terms to '', which we know isn't valid.
          // We'll filter it out later.
          return ['' as ValidTerm, 0 as InflectedFormId];
        }
      })
      .filter(Boolean);

    if (validDerivedDefinitions.keyCount === 0) {
      return;
    }

    const termToLemmaId = LemmaMut.ensureAllExist(
      context,
      languageId,
      Array.from(validDerivedDefinitions.keys())
    );

    const {db} = context;

    const values: any[] = [];
    for (const [term, inflectedFormId] of validDerivedDefinitions) {
      const lemmaId = termToLemmaId.get(term);
      if (lemmaId === undefined) {
        throw new Error(`Expected term to have a lemma ID: ${term}`);
      }
      values.push(
        db.raw`(${lemmaId}, ${originalDefinitionId}, ${inflectedFormId})`
      );
    }

    if (values.length > 0) {
      db.exec`
        insert into derived_definitions (
          lemma_id,
          original_definition_id,
          inflected_form_id
        )
        values ${values}
      `;
    }
  },

  deleteAll(db: DataWriter, originalDefinitionId: DefinitionId): void {
    db.exec`
      delete from derived_definitions
      where original_definition_id = ${originalDefinitionId}
    `;
  },
} as const;

export default DerivedDefinitionMut;
