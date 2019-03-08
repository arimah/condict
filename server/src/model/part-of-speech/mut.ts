import Mutator from '../mutator';

import {validateName} from './validators';
import ensurePartOfSpeechIsUnused from './ensure-unused';

export interface NewPartOfSpeechInput {
  languageId: string;
  name: string;
}

export interface EditPartOfSpeechInput {
  name?: string | null;
}

class PartOfSpeechMut extends Mutator {
  public async insert({languageId, name}: NewPartOfSpeechInput) {
    const {db} = this;
    const {PartOfSpeech, Language} = this.model;

    const language = await Language.byIdRequired(+languageId);

    name = await validateName(db, null, language.id, name);

    const {insertId} = await db.exec`
      insert into parts_of_speech (language_id, name)
      values (${language.id}, ${name})
    `;
    return PartOfSpeech.byId(insertId);
  }

  public async update(id: number, {name}: EditPartOfSpeechInput) {
    const {db} = this;
    const {PartOfSpeech} = this.model;

    const partOfSpeech = await PartOfSpeech.byIdRequired(id);

    if (name != null) {
      const newName = await validateName(
        db,
        partOfSpeech.id,
        partOfSpeech.language_id,
        name
      );

      await db.exec`
        update parts_of_speech
        set name = ${newName}
        where id = ${partOfSpeech.id}
      `;
      db.clearCache(PartOfSpeech.byIdKey, partOfSpeech.id);
    }

    return PartOfSpeech.byId(partOfSpeech.id);
  }

  public async delete(id: number) {
    const {db} = this;

    await ensurePartOfSpeechIsUnused(db, id);

    const {affectedRows} = await db.exec`
      delete from parts_of_speech
      where id = ${id}
    `;
    return affectedRows > 0;
  }
}

export default {PartOfSpeechMut};
