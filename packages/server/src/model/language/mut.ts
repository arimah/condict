import {LanguageId, NewLanguageInput, EditLanguageInput} from '../../graphql';

import FieldSet from '../field-set';
import {DescriptionMut} from '../description';
import {SearchIndexMut} from '../search-index';
import {DefinitionMut} from '../definition';
import {LemmaMut} from '../lemma';
import {PartOfSpeechMut} from '../part-of-speech';
import {InflectionTableMut} from '../inflection-table';
import {TagMut} from '../tag';

import {Language} from './model';
import {LanguageRow} from './types';
import {validateName} from './validators';
import {MutContext} from '../types';

const LanguageMut = {
  insert(context: MutContext, data: NewLanguageInput): Promise<LanguageRow> {
    const {name, description} = data;

    const validName = validateName(context.db, null, name);

    return MutContext.transact(context, context => {
      const {db, events, logger} = context;
      const desc = DescriptionMut.insert(db, description ?? []);

      const now = Date.now();
      const {insertId: languageId} = db.exec<LanguageId>`
        insert into languages (name, description_id, time_created, time_updated)
        values (${validName}, ${desc.id}, ${now}, ${now})
      `;

      SearchIndexMut.insertLanguage(db, languageId, validName);

      events.emit({type: 'language', action: 'create', id: languageId});
      logger.verbose(`Created language: ${languageId}`);

      return Language.byIdRequired(db, languageId);
    });
  },

  async update(
    context: MutContext,
    id: LanguageId,
    data: EditLanguageInput
  ): Promise<LanguageRow> {
    const {db} = context;
    const {name, description} = data;

    const language = await Language.byIdRequired(db, id);

    const newFields = new FieldSet<LanguageRow>();
    if (name != null) {
      newFields.set('name', validateName(db, language.id, name));
    }

    if (newFields.hasValues || description) {
      await MutContext.transact(context, context => {
        const {db, events, logger} = context;
        newFields.set('time_updated', Date.now());

        db.exec`
          update languages
          set ${newFields}
          where id = ${language.id}
        `;

        const newName = newFields.get('name');
        if (newName != null) {
          SearchIndexMut.updateLanguage(db, language.id, newName);
        }

        if (description) {
          DescriptionMut.update(db, language.description_id, description);
        }

        events.emit({type: 'language', action: 'update', id: language.id});
        logger.verbose(`Updated language: ${language.id}`);

        db.clearCache(Language.byIdKey, language.id);
      });
    }
    return Language.byIdRequired(db, id);
  },

  async delete(context: MutContext, id: LanguageId): Promise<boolean> {
    const {db} = context;

    const language = await Language.byId(db, id);
    if (!language) {
      return false;
    }

    await MutContext.transact(context, context => {
      const {db, events, logger} = context;

      logger.debug(`Begin deletion of language: ${language.id}`);

      // Definitions reference lemmas, parts of speech, inflection tables,
      // inflected forms... We must delete them before anything else.
      DefinitionMut.deleteAllInLanguage(db, language.id);
      logger.debug('Deleted all definitions');

      LemmaMut.deleteAllInLanguage(db, language.id);
      logger.debug('Deleted all lemmas');

      PartOfSpeechMut.deleteAllInLanguage(db, language.id);
      logger.debug('Deleted all parts of speech');

      InflectionTableMut.deleteAllInLanguage(db, language.id);
      logger.debug('Deleted all inflection tables');

      logger.debug(`Deleting language row: ${language.id}`);
      db.exec`
        delete from languages
        where id = ${language.id}
      `;

      DescriptionMut.delete(db, language.description_id);
      logger.debug('Deleted description');

      SearchIndexMut.deleteLanguage(db, language.id);

      events.emit({type: 'language', action: 'delete', id: language.id});

      logger.debug(`Deleting orphaned tags`);
      TagMut.deleteOrphaned(context);

      logger.verbose(`Language deleted: ${language.id}`);
    });
    return true;
  },
} as const;

export {LanguageMut};
