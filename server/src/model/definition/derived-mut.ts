import MultiMap from '../../utils/multi-map';

import Mutator from '../mutator';
import {validateTerm} from '../lemma/validators';

export default class DerivedDefinitionMut extends Mutator {
  public async insertAll(
    languageId: number,
    originalDefinitionId: number,
    derivedDefinitions: MultiMap<string, number>
  ): Promise<void> {
    const {db} = this;
    const {LemmaMut} = this.mut;

    // validateTerm may normalize the term, for example by trimming away
    // white space. When we insert our derived definitions, we must ensure
    // we use the normalized values, so build a map from validated term
    // to inflected form ID.

    const validDerivedDefinitions = derivedDefinitions
      // We can't add empty terms as lemmas, so just skip them.
      .filter(term => term !== '')
      .map((term, inflectedFormId) => {
        const validTerm = validateTerm(term);
        return [validTerm.value, inflectedFormId];
      });

    const termToLemmaId = await LemmaMut.ensureAllExist(
      languageId,
      Array.from(validDerivedDefinitions.keys())
        .map(value => ({value}))
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

  public async deleteAll(originalDefinitionId: number): Promise<void> {
    await this.db.exec`
      delete from derived_definitions
      where original_definition_id = ${originalDefinitionId}
    `;
  }
}
