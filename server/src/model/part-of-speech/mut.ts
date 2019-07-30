import {UserInputError} from 'apollo-server';

import Mutator from '../mutator';
import {toNumberId} from '../id-of';

import {
  PartOfSpeechId,
  PartOfSpeechRow,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
} from './types';
import {validateName} from './validators';

class PartOfSpeechMut extends Mutator {
  public async insert(
    {languageId, name}: NewPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
    const {db} = this;
    const {PartOfSpeech, Language} = this.model;

    const language = await Language.byIdRequired(toNumberId(languageId));

    name = await validateName(db, null, language.id, name);

    const {insertId} = await db.exec<PartOfSpeechId>`
      insert into parts_of_speech (language_id, name)
      values (${language.id}, ${name})
    `;
    return PartOfSpeech.byIdRequired(insertId);
  }

  public async update(
    id: PartOfSpeechId,
    {name}: EditPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
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

    return PartOfSpeech.byIdRequired(partOfSpeech.id);
  }

  public async delete(id: PartOfSpeechId): Promise<boolean> {
    const {db} = this;

    await this.ensureUnused(id);

    const {affectedRows} = await db.exec`
      delete from parts_of_speech
      where id = ${id}
    `;
    return affectedRows > 0;
  }

  private async ensureUnused(id: PartOfSpeechId) {
    const {Definition} = this.model;
    if (await Definition.anyUsesPartOfSpeech(id)) {
      throw new UserInputError(
        `Part of speech ${id} cannot be deleted because it is used by one or more lemmas`
      );
    }
  }
}

export default {PartOfSpeechMut};
