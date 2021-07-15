import {DataWriter} from '../../database';
import {DefinitionId, StemInput} from '../../graphql';

import {DefinitionStem} from './model';
import {validateStems} from './validators';

const buildStemMap = (stems: StemInput[]) => new Map(
  stems.map(stem => [stem.name, stem.value])
);

const DefinitionStemMut = {
  insert(
    db: DataWriter,
    definitionId: DefinitionId,
    stems: StemInput[]
  ): Map<string, string> {
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
  },

  async update(
    db: DataWriter,
    definitionId: DefinitionId,
    stems: StemInput[] | undefined | null
  ): Promise<Map<string, string>> {
    let stemMap: Map<string, string>;
    if (stems) {
      this.deleteAll(db, definitionId);
      stemMap = this.insert(db, definitionId, stems);
    } else {
      const currentStems = await DefinitionStem.allByDefinition(
        db,
        definitionId
      );
      stemMap = buildStemMap(currentStems);
    }

    return stemMap;
  },

  deleteAll(db: DataWriter, definitionId: DefinitionId): void {
    db.exec`
      delete from definition_stems
      where definition_id = ${definitionId}
    `;
  },
} as const;

export default DefinitionStemMut;
