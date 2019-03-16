import {UserInputError} from 'apollo-server';

import Mutator from '../mutator';

import {CustomInflectedFormInput} from './types';
import {validateFormValue} from './validators';

export default class CustomFormMut extends Mutator {
  public async insert(
    definitionTableId: number,
    inflectionTableId: number,
    customForms: CustomInflectedFormInput[]
  ): Promise<Map<number, string>> {
    const {db} = this;
    const {InflectedForm} = this.model;

    const allCustomForms = new Map<number, string>(
      await Promise.all(
        customForms.map(async form => {
          const inflectedForm = await InflectedForm.byIdRequired(
            +form.inflectedFormId,
            'inflectedFormId'
          );
          if (inflectedForm.inflection_table_id !== inflectionTableId) {
            throw new UserInputError(
              `Inflected form ${inflectedForm.id} belongs to the wrong table`,
              {invalidArgs: ['inflectedFormId']}
            );
          }

          const value = validateFormValue(form.value);
          return [inflectedForm.id, value] as [number, string];
        })
      )
    );

    if (allCustomForms.size > 0) {
      await db.exec`
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

  public async deleteAll(tableId: number): Promise<void> {
    await this.db.exec`
      delete from definition_forms
      where definition_inflection_table_id = ${tableId}
    `;
  }
}
