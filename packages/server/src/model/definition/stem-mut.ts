import {DefinitionId, StemInput} from '../../graphql/types';

import Mutator from '../mutator';

import {validateStems} from './validators';

const buildStemMap = (stems: StemInput[]) => new Map<string, string>(
  stems.map<[string, string]>(stem => [stem.name, stem.value])
);

export default class DefinitionStemMut extends Mutator {
  public insert(
    definitionId: DefinitionId,
    stems: StemInput[]
  ): Map<string, string> {
    const {db} = this;

    const finalStems = validateStems(stems);

    if (finalStems.length > 0) {
      db.exec`
        insert into definition_stems (definition_id, name, value)
        values ${finalStems.map(s =>
          db.raw`(${definitionId}, ${s.name}, ${s.value})`
        )}
      `;
    }

    return buildStemMap(finalStems);
  }

  public async update(
    definitionId: DefinitionId,
    stems: StemInput[] | undefined | null
  ): Promise<Map<string, string>> {
    const {DefinitionStem} = this.model;

    let stemMap: Map<string, string>;
    if (stems) {
      this.deleteAll(definitionId);
      stemMap = this.insert(definitionId, stems);
    } else {
      const currentStems = await DefinitionStem.allByDefinition(definitionId);
      stemMap = buildStemMap(currentStems);
    }

    return stemMap;
  }

  public deleteAll(definitionId: DefinitionId): void {
    this.db.exec`
      delete from definition_stems
      where definition_id = ${definitionId}
    `;
  }
}
