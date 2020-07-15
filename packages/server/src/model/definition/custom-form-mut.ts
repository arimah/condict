import {UserInputError} from 'apollo-server';

import {
  DefinitionInflectionTableId,
  CustomInflectedFormInput,
  InflectionTableLayoutId,
  InflectedFormId,
} from '../../graphql/types';

import Mutator from '../mutator';

export default class CustomFormMut extends Mutator {
  public async insert(
    definitionTableId: DefinitionInflectionTableId,
    inflectionTableLayoutId: InflectionTableLayoutId,
    customForms: CustomInflectedFormInput[]
  ): Promise<Map<InflectedFormId, string>> {
    const {db} = this;
    const {InflectedForm} = this.model;

    const allCustomForms = new Map<InflectedFormId, string>(
      await Promise.all(
        customForms.map(async form => {
          const inflectedForm = await InflectedForm.byIdRequired(
            form.inflectedFormId,
            'inflectedFormId'
          );
          if (inflectedForm.inflection_table_version_id !== inflectionTableLayoutId) {
            throw new UserInputError(
              `Inflected form ${inflectedForm.id} belongs to the wrong table`,
              {invalidArgs: ['inflectedFormId']}
            );
          }

          return [inflectedForm.id, form.value] as const;
        })
      )
    );

    if (allCustomForms.size > 0) {
      db.exec`
        insert into definition_forms (
          definition_inflection_table_id,
          inflected_form_id,
          inflected_form
        )
        values ${
          Array.from(allCustomForms).map(([id, value]) =>
            db.raw`(${definitionTableId}, ${id}, ${value})`
          )
        }
      `;
    }

    return allCustomForms;
  }

  public deleteAll(tableId: DefinitionInflectionTableId): void {
    this.db.exec`
      delete from definition_forms
      where definition_inflection_table_id = ${tableId}
    `;
  }
}
