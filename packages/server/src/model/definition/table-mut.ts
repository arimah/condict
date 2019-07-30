import {UserInputError} from 'apollo-server';

import {validateTableCaption} from '../../rich-text/validate';

import Mutator from '../mutator';
import {toNumberId} from '../id-of';
import {PartOfSpeechId} from '../part-of-speech/types';
import {
  InflectionTableId,
  InflectionTableRow,
  InflectionTableLayoutId,
  InflectionTableLayoutRow,
  InflectedFormId,
} from '../inflection-table/types';

import {
  DefinitionId,
  DefinitionInflectionTableId,
  NewDefinitionInflectionTableInput,
  EditDefinitionInflectionTableInput,
} from './types';
import deriveForms from './derive-forms';

export interface DefinitionInflectionTableResult {
  id: DefinitionInflectionTableId;
  derivedForms: Map<InflectedFormId, string>;
}

export interface DefinitionData {
  id: DefinitionId;
  term: string;
  stemMap: Map<string, string>;
  partOfSpeechId: PartOfSpeechId;
}

interface ValidateInflectionTableResult {
  inflectionTable: InflectionTableRow;
  currentLayout: InflectionTableLayoutRow;
}

export default class DefinitionInflectionTableMut extends Mutator {
  public async insert(
    definition: DefinitionData,
    {inflectionTableId, caption, customForms}: NewDefinitionInflectionTableInput,
    index: number
  ): Promise<DefinitionInflectionTableResult> {
    const {db} = this;
    const {CustomFormMut} = this.mut;

    const {inflectionTable, currentLayout} = await this.validateInflectionTableId(
      toNumberId(inflectionTableId),
      definition.partOfSpeechId
    );
    const finalCaption = validateTableCaption(caption);

    const {insertId: tableId} = await db.exec<DefinitionInflectionTableId>`
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
      tableId,
      currentLayout.id,
      customForms
    );

    const derivedForms = await this.deriveAllForms(
      tableId,
      definition.term,
      definition.stemMap,
      currentLayout.id,
      customFormMap
    );

    return {id: tableId as DefinitionInflectionTableId, derivedForms};
  }

  public async update(
    id: DefinitionInflectionTableId,
    definition: DefinitionData,
    {caption, customForms, upgradeTableLayout}: EditDefinitionInflectionTableInput,
    index: number
  ): Promise<DefinitionInflectionTableResult> {
    const {db} = this;
    const {DefinitionInflectionTable, InflectionTableLayout} = this.model;
    const {CustomFormMut} = this.mut;

    const table = await DefinitionInflectionTable.byIdRequired(id);
    if (table.definition_id !== definition.id) {
      throw new UserInputError(
        `Definition inflection table ${id} belongs to the wrong definition`,
        {invalidArgs: ['id']}
      );
    }

    const {currentLayout} = await this.validateInflectionTableId(
      table.inflection_table_id,
      definition.partOfSpeechId
    );

    let tableLayout = await InflectionTableLayout.byIdRequired(
      table.inflection_table_version_id
    );
    if (tableLayout.is_current === 0 && upgradeTableLayout) {
      tableLayout = currentLayout;
    }

    const finalCaption = validateTableCaption(caption);

    await db.exec`
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
    await CustomFormMut.deleteAll(id);
    const customFormMap = await CustomFormMut.insert(
      id,
      tableLayout.id,
      customForms
    );

    const derivedForms = await this.deriveAllForms(
      table.id,
      definition.term,
      definition.stemMap,
      tableLayout.id,
      customFormMap
    );

    return {id, derivedForms};
  }

  private async validateInflectionTableId(
    inflectionTableId: InflectionTableId,
    partOfSpeechId: PartOfSpeechId
  ): Promise<ValidateInflectionTableResult> {
    const {InflectionTable, InflectionTableLayout} = this.model;

    const inflectionTable = await InflectionTable.byIdRequired(
      inflectionTableId,
      'inflectionTableId'
    );
    if (inflectionTable.part_of_speech_id !== partOfSpeechId) {
      throw new UserInputError(
        `Inflection table ${inflectionTable.id} belongs to the wrong part of speech`,
        {invalidArgs: ['inflectionTableId']}
      );
    }

    const currentLayout =
      await InflectionTableLayout.currentByTableRequired(inflectionTable.id);

    return {inflectionTable, currentLayout};
  }

  public async deriveAllForms(
    tableId: DefinitionInflectionTableId,
    term: string,
    stemMap: Map<string, string>,
    inflectionTableLayoutId: InflectionTableLayoutId,
    customForms: Map<InflectedFormId, string>
  ): Promise<Map<InflectedFormId, string>> {
    const {InflectedForm} = this.model;

    const derivedForms = deriveForms(
      term,
      stemMap,
      await InflectedForm.allDerivableByTableLayout(inflectionTableLayoutId)
    );

    customForms.forEach((formValue, formId) => {
      if (derivedForms.has(formId)) {
        derivedForms.set(formId, formValue);
      }
    });

    return derivedForms;
  }

  public async deleteOld(
    definitionId: DefinitionId,
    currentIds: DefinitionInflectionTableId[]
  ): Promise<void> {
    const {db} = this;
    await db.exec`
      delete from definition_inflection_tables
      where definition_id = ${definitionId}
        ${
          currentIds.length > 0
            ? db.raw`and id not in (${currentIds})`
            : ''
        }
    `;
  }
}
