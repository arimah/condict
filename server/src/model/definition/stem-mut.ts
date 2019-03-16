import Mutator from '../mutator';

import {StemInput} from './types';
import {validateStems} from './validators';

const buildStemMap = (stems: StemInput[]) => new Map<string, string>(
  stems.map<[string, string]>(stem => [stem.name, stem.value])
);

export default class DefinitionStemMut extends Mutator {
  public async insert(
    definitionId: number,
    stems: StemInput[]
  ): Promise<Map<string, string>> {
    const {db} = this;

    const finalStems = validateStems(stems);

    if (finalStems.length > 0) {
      await db.exec`
        insert into definition_stems (definition_id, name, value)
        values ${finalStems.map(s =>
          db.raw`(${definitionId}, ${s.name}, ${s.value})`
        )}
      `;
    }

    return buildStemMap(finalStems);
  }

  public async update(
    definitionId: number,
    stems: StemInput[] | undefined | null
  ): Promise<Map<string, string>> {
    const {DefinitionStem} = this.model;

    let stemMap: Map<string, string>;
    if (stems) {
      await this.deleteAll(definitionId);
      stemMap = await this.insert(definitionId, stems);
    } else {
      const currentStems = await DefinitionStem.allByDefinition(definitionId);
      stemMap = buildStemMap(currentStems);
    }

    return stemMap;
  }

  public async deleteAll(definitionId: number): Promise<void> {
    await this.db.exec`
      delete from definition_stems
      where definition_id = ${definitionId}
    `;
  }
}
