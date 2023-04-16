import {DataWriter} from '../../database';
import {
  DefinitionId,
  DefinitionInflectionTableId,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  LanguageId,
  NewDefinitionInflectionTableInput,
  EditDefinitionInflectionTableInput,
} from '../../graphql';
import {validateTableCaption} from '../../rich-text';
import {UserInputError} from '../../errors';

import {
  InflectionTable,
  InflectionTableLayout,
  InflectedForm,
  InflectionTableRow,
  InflectionTableLayoutRow,
} from '../inflection-table';

import {DefinitionInflectionTable} from './model';
import CustomFormMut from './custom-form-mut';
import deriveForms from './derive-forms';

export type DefinitionInflectionTableResult = {
  id: DefinitionInflectionTableId;
  derivedForms: Map<InflectedFormId, string>;
};

export type DefinitionData = {
  id: DefinitionId;
  term: string;
  stemMap: Map<string, string>;
  languageId: LanguageId;
};

type ValidateInflectionTableResult = {
  inflectionTable: InflectionTableRow;
  currentLayout: InflectionTableLayoutRow;
};

const DefinitionInflectionTableMut = {
  async insert(
    db: DataWriter,
    definition: DefinitionData,
    data: NewDefinitionInflectionTableInput,
    index: number
  ): Promise<DefinitionInflectionTableResult> {
    const {inflectionTableId, caption, customForms} = data;

    const {
      inflectionTable,
      currentLayout,
    } = await this.validateInflectionTableId(
      db,
      inflectionTableId,
      definition.languageId
    );
    const finalCaption = validateTableCaption(caption);

    const {insertId: tableId} = db.exec<DefinitionInflectionTableId>`
      insert into definition_inflection_tables (
        definition_id,
        inflection_table_id,
        inflection_table_version_id,
        sort_order,
        caption
      )
      values (
        ${definition.id},
        ${inflectionTable.id},
        ${currentLayout.id},
        ${index},
        ${finalCaption && JSON.stringify(finalCaption)}
      )
    `;

    const customFormMap = await CustomFormMut.insert(
      db,
      tableId,
      currentLayout.id,
      customForms
    );

    const derivedForms = this.deriveAllForms(
      db,
      tableId,
      definition.term,
      definition.stemMap,
      currentLayout.id,
      customFormMap
    );

    return {id: tableId, derivedForms};
  },

  async update(
    db: DataWriter,
    id: DefinitionInflectionTableId,
    definition: DefinitionData,
    data: EditDefinitionInflectionTableInput,
    index: number
  ): Promise<DefinitionInflectionTableResult> {
    const {caption, customForms, upgradeTableLayout} = data;

    const table = await DefinitionInflectionTable.byIdRequired(db, id);
    if (table.definition_id !== definition.id) {
      throw new UserInputError(
        `Definition inflection table ${id} belongs to the wrong definition`,
        {invalidArgs: ['id']}
      );
    }

    const {currentLayout} = await this.validateInflectionTableId(
      db,
      table.inflection_table_id,
      definition.languageId
    );

    let tableLayout = await InflectionTableLayout.byIdRequired(
      db,
      table.inflection_table_version_id
    );
    if (tableLayout.is_current === 0 && upgradeTableLayout) {
      tableLayout = currentLayout;
    }

    const finalCaption = validateTableCaption(caption);

    db.exec`
      update definition_inflection_tables
      set
        caption = ${finalCaption && JSON.stringify(finalCaption)},
        inflection_table_version_id = ${tableLayout.id},
        sort_order = ${index}
      where id = ${table.id}
    `;
    db.clearCache(DefinitionInflectionTable.byIdKey, table.id);

    // We could compute a custom forms delta, but it's kind of messy.
    // It's much easier to just delete all old forms and insert the new.
    // This all happens inside a transaction anyway.
    CustomFormMut.deleteAll(db, id);
    const customFormMap = await CustomFormMut.insert(
      db,
      id,
      tableLayout.id,
      customForms
    );

    const derivedForms = this.deriveAllForms(
      db,
      table.id,
      definition.term,
      definition.stemMap,
      tableLayout.id,
      customFormMap
    );

    return {id, derivedForms};
  },

  async validateInflectionTableId(
    db: DataWriter,
    inflectionTableId: InflectionTableId,
    languageId: LanguageId
  ): Promise<ValidateInflectionTableResult> {
    const inflectionTable = await InflectionTable.byIdRequired(
      db,
      inflectionTableId,
      'inflectionTableId'
    );
    if (inflectionTable.language_id !== languageId) {
      throw new UserInputError(
        `Inflection table ${inflectionTable.id} belongs to the wrong language`,
        {invalidArgs: ['inflectionTableId']}
      );
    }

    const currentLayout =
      await InflectionTableLayout.currentByTableRequired(db, inflectionTable.id);

    return {inflectionTable, currentLayout};
  },

  deriveAllForms(
    db: DataWriter,
    tableId: DefinitionInflectionTableId,
    term: string,
    stemMap: Map<string, string>,
    inflectionTableLayoutId: InflectionTableLayoutId,
    customForms: Map<InflectedFormId, string>
  ): Map<InflectedFormId, string> {
    const derivedForms = deriveForms(
      term,
      stemMap,
      InflectedForm.allDerivableByTableLayout(db, inflectionTableLayoutId)
    );

    customForms.forEach((formValue, formId) => {
      if (derivedForms.has(formId)) {
        derivedForms.set(formId, formValue);
      }
    });

    return derivedForms;
  },

  deleteOld(
    db: DataWriter,
    definitionId: DefinitionId,
    currentIds: DefinitionInflectionTableId[]
  ): void {
    db.exec`
      delete from definition_inflection_tables
      where definition_id = ${definitionId}
        ${
          currentIds.length > 0
            ? db.raw`and id not in (${currentIds})`
            : db.raw``
        }
    `;
  },
};

export default DefinitionInflectionTableMut;
