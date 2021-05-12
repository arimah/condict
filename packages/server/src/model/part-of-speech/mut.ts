import {UserInputError} from 'apollo-server';

import {DataAccessor, DataReader} from '../../database';
import {
  PartOfSpeechId,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
} from '../../graphql';

import {Language} from '../language';
import {Definition} from '../definition';
import {SearchIndexMut} from '../search-index';

import {PartOfSpeech} from './model';
import {PartOfSpeechRow} from './types';
import {validateName} from './validators';

const PartOfSpeechMut = {
  async insert(
    db: DataAccessor,
    data: NewPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
    const {languageId} = data;
    let {name} = data;

    const language = await Language.byIdRequired(db, languageId);

    name = validateName(db, null, language.id, name);

    return db.transact(db => {
      const {insertId} = db.exec<PartOfSpeechId>`
        insert into parts_of_speech (language_id, name)
        values (${language.id}, ${name})
      `;

      SearchIndexMut.insertPartOfSpeech(db, insertId, name);

      return PartOfSpeech.byIdRequired(db, insertId);
    });
  },

  async update(
    db: DataAccessor,
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

      await db.transact(db => {
        db.exec`
          update parts_of_speech
          set name = ${newName}
          where id = ${partOfSpeech.id}
        `;

        SearchIndexMut.updatePartOfSpeech(db, partOfSpeech.id, newName);

        db.clearCache(PartOfSpeech.byIdKey, partOfSpeech.id);
      });
    }

    return PartOfSpeech.byIdRequired(db, partOfSpeech.id);
  },

  delete(db: DataAccessor, id: PartOfSpeechId): Promise<boolean> {
    this.ensureUnused(db, id);

    return db.transact(db => {
      const {affectedRows} = db.exec`
        delete from parts_of_speech
        where id = ${id}
      `;

      SearchIndexMut.deletePartOfSpeech(db, id);

      return affectedRows > 0;
    });
  },

  ensureUnused(db: DataReader, id: PartOfSpeechId) {
    if (Definition.anyUsesPartOfSpeech(db, id)) {
      throw new UserInputError(
        `Part of speech ${id} cannot be deleted because it is used by one or more lemmas`
      );
    }
  },
} as const;

export {PartOfSpeechMut};
