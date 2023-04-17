import {DataReader, DataWriter} from '../../database';
import {
  PartOfSpeechId,
  LanguageId,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
} from '../../graphql';
import {UserInputError} from '../../errors';

import {Language} from '../language';
import {Definition} from '../definition';
import {DescriptionMut} from '../description';
import {SearchIndexMut} from '../search-index';
import {MutContext} from '../types';

import {PartOfSpeech} from './model';
import {PartOfSpeechRow} from './types';
import {validateName} from './validators';
import FieldSet from '../field-set';

const PartOfSpeechMut = {
  async insert(
    context: MutContext,
    data: NewPartOfSpeechInput
  ): Promise<PartOfSpeechRow> {
    const {languageId} = data;
    const {name, description} = data;

    const language = await Language.byIdRequired(context.db, languageId);

    const validName = validateName(context.db, null, language.id, name);

    return MutContext.transact(context, context => {
      const {db, events, logger} = context;
      const desc = DescriptionMut.insert(db, description ?? []);

      const now = Date.now();
      const {insertId} = db.exec<PartOfSpeechId>`
        insert into parts_of_speech (
          language_id,
          description_id,
          name,
          time_created,
          time_updated
        )
        values (${language.id}, ${desc.id}, ${validName}, ${now}, ${now})
      `;

      SearchIndexMut.insertPartOfSpeech(db, insertId, validName);

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
    const {name, description} = data;
    const {db} = context;

    const partOfSpeech = await PartOfSpeech.byIdRequired(context.db, id);

    const newFields = new FieldSet<PartOfSpeechRow>();
    if (name != null) {
      newFields.set('name', validateName(
        db,
        partOfSpeech.id,
        partOfSpeech.language_id,
        name
      ));
    }

    if (newFields.hasValues || description) {
      await MutContext.transact(context, context => {
        const {db, events, logger} = context;
        newFields.set('time_updated', Date.now());
        db.exec`
          update parts_of_speech
          set ${newFields}
          where id = ${partOfSpeech.id}
        `;

        const newName = newFields.get('name');
        if (newName != null) {
          SearchIndexMut.updatePartOfSpeech(db, partOfSpeech.id, newName);
        }

        if (description) {
          DescriptionMut.update(db, partOfSpeech.description_id, description);
        }

        events.emit({
          type: 'partOfSpeech',
          action: 'update',
          id: partOfSpeech.id,
          languageId: partOfSpeech.language_id,
        });
        logger.verbose(`Updated part of speech: ${partOfSpeech.id}`);

        db.clearCache(PartOfSpeech.byIdKey, partOfSpeech.id);
      });
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
