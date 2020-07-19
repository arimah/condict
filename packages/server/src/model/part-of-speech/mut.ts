import {UserInputError} from 'apollo-server';

import {Connection} from '../../database';
import {
  PartOfSpeechId,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
} from '../../graphql/types';

import {Language} from '../language';
import {Definition} from '../definition';

import {PartOfSpeech} from './model';
import {PartOfSpeechRow} from './types';
import {validateName} from './validators';

const PartOfSpeechMut = {
  async insert(
    db: Connection,
    data: NewPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
    const {languageId} = data;
    let {name} = data;

    const language = await Language.byIdRequired(db, languageId);

    name = validateName(db, null, language.id, name);

    const {insertId} = db.exec<PartOfSpeechId>`
      insert into parts_of_speech (language_id, name)
      values (${language.id}, ${name})
    `;
    return PartOfSpeech.byIdRequired(db, insertId);
  },

  async update(
    db: Connection,
    id: PartOfSpeechId,
    data: EditPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
    const {name} = data;

    const partOfSpeech = await PartOfSpeech.byIdRequired(db, id);

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

    return PartOfSpeech.byIdRequired(db, partOfSpeech.id);
  },

  delete(db: Connection, id: PartOfSpeechId): boolean {
    this.ensureUnused(db, id);

    const {affectedRows} = db.exec`
      delete from parts_of_speech
      where id = ${id}
    `;
    return affectedRows > 0;
  },

  ensureUnused(db: Connection, id: PartOfSpeechId) {
    if (Definition.anyUsesPartOfSpeech(db, id)) {
      throw new UserInputError(
        `Part of speech ${id} cannot be deleted because it is used by one or more lemmas`
      );
    }
  },
} as const;

export {PartOfSpeechMut};
