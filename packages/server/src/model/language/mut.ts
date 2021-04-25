import {DataAccessor, DataWriter} from '../../database';
import {validateDescription} from '../../rich-text';
import {
  LanguageId,
  NewLanguageInput,
  EditLanguageInput,
  BlockElementInput,
} from '../../graphql';

import FieldSet from '../field-set';

import {Language} from './model';
import {LanguageRow} from './types';
import {validateName} from './validators';

const LanguageMut = {
  insert(db: DataAccessor, data: NewLanguageInput): Promise<LanguageRow> {
    const {name, description} = data;

    const validName = validateName(db, null, name);

    return db.transact(db => {
      const {insertId: languageId} = db.exec<LanguageId>`
        insert into languages (name)
        values (${validName})
      `;

      LanguageDescriptionMut.insert(db, languageId, description || []);

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
        }

        if (description) {
          LanguageDescriptionMut.update(db, language.id, description);
        }

        db.clearCache(Language.byIdKey, language.id);
      });
    }
    return Language.byIdRequired(db, id);
  },
} as const;

const LanguageDescriptionMut = {
  insert(
    db: DataWriter,
    languageId: LanguageId,
    description: BlockElementInput[]
  ): void {
    const finalDescription = validateDescription(description, () => { /* ignore */ });

    db.exec`
      insert into language_descriptions (language_id, description)
      values (${languageId}, ${JSON.stringify(finalDescription)})
    `;
  },

  update(
    db: DataWriter,
    languageId: LanguageId,
    description: BlockElementInput[]
  ): void {
    const finalDescription = validateDescription(description, () => { /* ignore */ });

    db.exec`
      update language_descriptions
      set description = ${JSON.stringify(finalDescription)}
      where language_id = ${languageId}
    `;
  },
} as const;

export {LanguageMut, LanguageDescriptionMut};
