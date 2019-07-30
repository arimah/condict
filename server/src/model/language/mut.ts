import Mutator from '../mutator';
import FieldSet from '../field-set';

import {
  LanguageId,
  LanguageRow,
  NewLanguageInput,
  EditLanguageInput,
} from './types';
import {validateName, validateUrlName} from './validators';

class LanguageMut extends Mutator {
  public async insert(
    {name, urlName}: NewLanguageInput
  ): Promise<LanguageRow> {
    const {db} = this;
    const {Language} = this.model;

    name = await validateName(db, null, name);
    urlName = await validateUrlName(db, null, urlName);

    const {insertId} = await db.exec<LanguageId>`
      insert into languages (name, url_name)
      values (${name}, ${urlName})
    `;
    return Language.byIdRequired(insertId);
  }

  public async update(
    id: LanguageId,
    {name, urlName}: EditLanguageInput
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

    if (urlName != null) {
      newFields.set(
        'url_name',
        await validateUrlName(db, language.id, urlName)
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
