import {
  LanguageId,
  NewLanguageInput,
  EditLanguageInput,
} from '../../graphql/types';

import Mutator from '../mutator';
import FieldSet from '../field-set';

import {LanguageRow} from './types';
import {validateName} from './validators';

class LanguageMut extends Mutator {
  public async insert(
    {name}: NewLanguageInput
  ): Promise<LanguageRow> {
    const {db} = this;
    const {Language} = this.model;

    name = await validateName(db, null, name);

    const {insertId} = await db.exec<LanguageId>`
      insert into languages (name)
      values (${name})
    `;
    return Language.byIdRequired(insertId);
  }

  public async update(
    id: LanguageId,
    {name}: EditLanguageInput
  ): Promise<LanguageRow> {
    const {db} = this;
    const {Language} = this.model;

    const language = await Language.byIdRequired(id);

    const newFields = new FieldSet<LanguageRow>();
    if (name != null) {
      newFields.set(
        'name',
        await validateName(db, language.id, name)
      );
    }

    if (newFields.hasValues) {
      await db.exec`
        update languages
        set ${newFields}
        where id = ${language.id}
      `;
      db.clearCache(Language.byIdKey, language.id);
    }
    return Language.byIdRequired(id);
  }
}

export default {LanguageMut};
