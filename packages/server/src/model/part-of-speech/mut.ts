import {UserInputError} from 'apollo-server';

import {
  PartOfSpeechId,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
} from '../../graphql/types';

import Mutator from '../mutator';

import {PartOfSpeechRow} from './types';
import {validateName} from './validators';

class PartOfSpeechMut extends Mutator {
  public async insert(
    {languageId, name}: NewPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
    const {db} = this;
    const {PartOfSpeech, Language} = this.model;

    const language = await Language.byIdRequired(languageId);

    name = validateName(db, null, language.id, name);

    const {insertId} = db.exec<PartOfSpeechId>`
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
      const newName = validateName(
        db,
        partOfSpeech.id,
        partOfSpeech.language_id,
        name
      );

      db.exec`
        update parts_of_speech
        set name = ${newName}
        where id = ${partOfSpeech.id}
      `;
      db.clearCache(PartOfSpeech.byIdKey, partOfSpeech.id);
    }

    return PartOfSpeech.byIdRequired(partOfSpeech.id);
  }

  public delete(id: PartOfSpeechId): boolean {
    const {db} = this;

    this.ensureUnused(id);

    const {affectedRows} = db.exec`
      delete from parts_of_speech
      where id = ${id}
    `;
    return affectedRows > 0;
  }

  private ensureUnused(id: PartOfSpeechId) {
    const {Definition} = this.model;
    if (Definition.anyUsesPartOfSpeech(id)) {
      throw new UserInputError(
        `Part of speech ${id} cannot be deleted because it is used by one or more lemmas`
      );
    }
  }
}

export default {PartOfSpeechMut};
