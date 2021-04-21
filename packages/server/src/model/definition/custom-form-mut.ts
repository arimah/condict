import {UserInputError} from 'apollo-server';

import {DataWriter} from '../../database';
import {
  DefinitionInflectionTableId,
  CustomInflectedFormInput,
  InflectionTableLayoutId,
  InflectedFormId,
} from '../../graphql';

import {InflectedForm} from '../inflection-table';

const CustomFormMut = {
  async insert(
    db: DataWriter,
    definitionTableId: DefinitionInflectionTableId,
    inflectionTableLayoutId: InflectionTableLayoutId,
    customForms: CustomInflectedFormInput[]
  ): Promise<Map<InflectedFormId, string>> {
    const allCustomForms = new Map<InflectedFormId, string>(
      await Promise.all(
        customForms.map(async form => {
          const inflectedForm = await InflectedForm.byIdRequired(
            db,
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
  },

  deleteAll(db: DataWriter, tableId: DefinitionInflectionTableId): void {
    db.exec`
      delete from definition_forms
      where definition_inflection_table_id = ${tableId}
    `;
  },
} as const;

export default CustomFormMut;
