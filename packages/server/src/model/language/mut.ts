import {Connection} from '../../database';
import {LanguageId, NewLanguageInput, EditLanguageInput} from '../../graphql';

import FieldSet from '../field-set';

import {Language} from './model';
import {LanguageRow} from './types';
import {validateName} from './validators';

const LanguageMut = {
  insert(db: Connection, data: NewLanguageInput): Promise<LanguageRow> {
    let {name} = data;

    name = validateName(db, null, name);

    const {insertId} = db.exec<LanguageId>`
      insert into languages (name)
      values (${name})
    `;
    return Language.byIdRequired(db, insertId);
  },

  async update(
    db: Connection,
    id: LanguageId,
    data: EditLanguageInput
  ): Promise<LanguageRow> {
    const {name} = data;

    const language = await Language.byIdRequired(db, id);

    const newFields = new FieldSet<LanguageRow>();
    if (name != null) {
      newFields.set('name', validateName(db, language.id, name));
    }

    if (newFields.hasValues) {
      db.exec`
        update languages
        set ${newFields}
        where id = ${language.id}
      `;
      db.clearCache(Language.byIdKey, language.id);
    }
    return Language.byIdRequired(db, id);
  },
} as const;

export {LanguageMut};
