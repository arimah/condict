import {UserInputError} from 'apollo-server';

import {DataReader, DataWriter} from '../../database';
import {
  PartOfSpeechId,
  LanguageId,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
} from '../../graphql';

import {Language} from '../language';
import {Definition} from '../definition';
import {SearchIndexMut} from '../search-index';
import {MutContext} from '../types';

import {PartOfSpeech} from './model';
import {PartOfSpeechRow} from './types';
import {validateName} from './validators';

const PartOfSpeechMut = {
  async insert(
    context: MutContext,
    data: NewPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
    const {languageId} = data;
    let {name} = data;

    const language = await Language.byIdRequired(context.db, languageId);

    name = validateName(context.db, null, language.id, name);

    return MutContext.transact(context, context => {
      const {db, events, logger} = context;
      const now = Date.now();
      const {insertId} = db.exec<PartOfSpeechId>`
        insert into parts_of_speech (
          language_id,
          name,
          time_created,
          time_updated
        )
        values (${language.id}, ${name}, ${now}, ${now})
      `;

      SearchIndexMut.insertPartOfSpeech(db, insertId, name);

      events.emit({
        type: 'partOfSpeech',
        action: 'create',
        id: insertId,
        languageId: language.id,
      });
      logger.verbose(`Created part of speech: ${insertId}`);

      return PartOfSpeech.byIdRequired(db, insertId);
    });
  },

  async update(
    context: MutContext,
    id: PartOfSpeechId,
    data: EditPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
    const {name} = data;
    const {db} = context;

    const partOfSpeech = await PartOfSpeech.byIdRequired(context.db, id);

    if (name != null) {
      const newName = validateName(
        db,
        partOfSpeech.id,
        partOfSpeech.language_id,
        name
      );

      await MutContext.transact(context, context => {
        const {db, events, logger} = context;
        db.exec`
          update parts_of_speech
          set
            name = ${newName},
            time_updated = ${Date.now()}
          where id = ${partOfSpeech.id}
        `;

        SearchIndexMut.updatePartOfSpeech(db, partOfSpeech.id, newName);

        events.emit({
          type: 'partOfSpeech',
          action: 'update',
          id: partOfSpeech.id,
          languageId: partOfSpeech.language_id,
        });
        logger.verbose(`Updated part of speech: ${partOfSpeech.id}`);
      });

      db.clearCache(PartOfSpeech.byIdKey, partOfSpeech.id);
    }

    return PartOfSpeech.byIdRequired(db, partOfSpeech.id);
  },

  async delete(context: MutContext, id: PartOfSpeechId): Promise<boolean> {
    const {db} = context;
    const partOfSpeech = await PartOfSpeech.byId(db, id);
    if (!partOfSpeech) {
      return false;
    }

    this.ensureUnused(db, partOfSpeech.id);

    await MutContext.transact(context, context => {
      const {db, events, logger} = context;
      db.exec`
        delete from parts_of_speech
        where id = ${partOfSpeech.id}
      `;

      SearchIndexMut.deletePartOfSpeech(db, partOfSpeech.id);

      events.emit({
        type: 'partOfSpeech',
        action: 'delete',
        id: partOfSpeech.id,
        languageId: partOfSpeech.language_id,
      });
      logger.verbose(`Deleted part of speech: ${partOfSpeech.id}`);
    });

    db.clearCache(PartOfSpeech.byIdKey, partOfSpeech.id);
    return true;
  },

  deleteAllInLanguage(db: DataWriter, languageId: LanguageId): void {
    SearchIndexMut.deleteAllPartsOfSpeechInLanguage(db, languageId);

    db.exec`
      delete from parts_of_speech
      where language_id = ${languageId}
    `;
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
