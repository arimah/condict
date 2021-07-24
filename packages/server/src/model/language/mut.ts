import {LanguageId, NewLanguageInput, EditLanguageInput} from '../../graphql';

import FieldSet from '../field-set';
import {DescriptionMut} from '../description';
import {SearchIndexMut} from '../search-index';

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
      const desc = DescriptionMut.insert(db, description || []);

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
} as const;

export {LanguageMut};
