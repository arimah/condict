import MultiMap from '../../utils/multi-map';

import Mutator from '../mutator';

export default class DerivedDefinitionMut extends Mutator {
  public async insertAll(
    languageId: number,
    originalDefinitionId: number,
    derivedDefinitions: MultiMap<string, number>
  ): Promise<void> {
    for (const [term, inflectedFormId] of derivedDefinitions) {
      if (!term) {
        // Can't add an empty term – just skip these.
        continue;
      }
      await this.insert(
        languageId,
        term,
        originalDefinitionId,
        inflectedFormId
      );
    }
  }

  public async insert(
    languageId: number,
    term: string,
    originalDefinitionId: number,
    inflectedFormId: number
  ): Promise<void> {
    const {LemmaMut} = this.mut;

    const lemmaId = await LemmaMut.ensureExists(languageId, term);

    await this.db.exec`
      insert into derived_definitions (
        lemma_id,
        original_definition_id,
        inflected_form_id
      )
      values (${lemmaId}, ${originalDefinitionId}, ${inflectedFormId})
    `;
  }

  public async deleteAll(originalDefinitionId: number): Promise<void> {
    await this.db.exec`
      delete from derived_definitions
      where original_definition_id = ${originalDefinitionId}
    `;
  }
}
