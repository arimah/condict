import MultiMap from '../../utils/multi-map';

import Mutator from '../mutator';
import {LanguageId} from '../language/types';
import {InflectedFormId} from '../inflection-table/types';
import {validateTerm, ValidTerm} from '../lemma/validators';

import {DefinitionId} from './types';

export default class DerivedDefinitionMut extends Mutator {
  public async insertAll(
    languageId: LanguageId,
    originalDefinitionId: DefinitionId,
    derivedDefinitions: MultiMap<string, InflectedFormId>
  ): Promise<void> {
    const {db} = this;
    const {LemmaMut} = this.mut;

    // validateTerm may normalize the term, for example by trimming away
    // white space. When we insert our derived definitions, we must ensure
    // we use the normalized values, so build a map from validated term
    // to inflected form ID.
    //
    // If validation fails for any given derived definition, we simply
    // ignore it. This can happen if the term is empty (in which case we
    // don't want it in the dictionary anyway), or if it's too long (in
    // which case we *can't* add it without risking truncation). Generally
    // it's preferable to add what we can.

    const validDerivedDefinitions = derivedDefinitions
      .map((term, inflectedFormId) => {
        try {
          const validTerm = validateTerm(term);
          return [validTerm, inflectedFormId];
        } catch (e) {
          // Add invalid terms to '', which we know isn't valid.
          // We'll filter it out later.
          return ['', 0 as InflectedFormId];
        }
      })
      .filter(Boolean);

    const termToLemmaId = await LemmaMut.ensureAllExist(
      languageId,
      Array.from(validDerivedDefinitions.keys()) as ValidTerm[]
    );

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
      await db.exec`
        insert into derived_definitions (
          lemma_id,
          original_definition_id,
          inflected_form_id
        )
        values ${values}
      `;
    }
  }

  public async deleteAll(originalDefinitionId: DefinitionId): Promise<void> {
    await this.db.exec`
      delete from derived_definitions
      where original_definition_id = ${originalDefinitionId}
    `;
  }
}
