import {DataAccessor} from '../../database';
import {
  LanguageId,
  NewLanguageInput,
  EditLanguageInput,
} from '../../graphql';

import FieldSet from '../field-set';
import {DescriptionMut} from '../description';
import {SearchIndexMut} from '../search-index';

import {Language} from './model';
import {LanguageRow} from './types';
import {validateName} from './validators';

const LanguageMut = {
  insert(db: DataAccessor, data: NewLanguageInput): Promise<LanguageRow> {
    const {name, description} = data;

    const validName = validateName(db, null, name);

    return db.transact(db => {
      const desc = DescriptionMut.insert(db, description || []);

      const {insertId: languageId} = db.exec<LanguageId>`
        insert into languages (name, description_id)
        values (${validName}, ${desc.id})
      `;

      SearchIndexMut.insertLanguage(db, languageId, validName);

      return Language.byIdRequired(db, languageId);
    });
  },

  async update(
    db: DataAccessor,
    id: LanguageId,
    data: EditLanguageInput
  ): Promise<LanguageRow> {
    const {name, description} = data;

    const language = await Language.byIdRequired(db, id);

    const newFields = new FieldSet<LanguageRow>();
    if (name != null) {
      newFields.set('name', validateName(db, language.id, name));
    }

    if (newFields.hasValues || description) {
      await db.transact(db => {
        if (newFields.hasValues) {
          db.exec`
            update languages
            set ${newFields}
            where id = ${language.id}
          `;

          const newName = newFields.get('name');
          if (newName != null) {
            SearchIndexMut.updateLanguage(db, language.id, newName);
          }
        }

        if (description) {
          DescriptionMut.update(db, language.description_id, description);
        }

        db.clearCache(Language.byIdKey, language.id);
      });
    }
    return Language.byIdRequired(db, id);
  },
} as const;

export {LanguageMut};
