import {UserInputError} from 'apollo-server';

import {validateTableCaption} from '../../rich-text/validate';

import Mutator from '../mutator';
import {InflectionTableRow} from '../inflection-table/types';

import {DefinitionInflectionTableInput} from './types';
import deriveForms from './derive-forms';

export interface DefinitionInflectionTableResult {
  id: number;
  derivedForms: Map<number, string>;
}

export interface DefinitionData {
  id: number;
  term: string;
  stemMap: Map<string, string>;
  partOfSpeechId: number;
}

export default class DefinitionInflectionTableMut extends Mutator {
  public async insert(
    definition: DefinitionData,
    {inflectionTableId, caption, customForms}: DefinitionInflectionTableInput,
    index: number
  ): Promise<DefinitionInflectionTableResult> {
    const {db} = this;
    const {CustomFormMut} = this.mut;

    const inflectionTable = await this.validateInflectionTableId(
      +inflectionTableId,
      definition.partOfSpeechId
    );
    const finalCaption = validateTableCaption(caption);

    const {insertId: tableId} = await db.exec`
      insert into definition_inflection_tables (
        definition_id,
        inflection_table_id,
        sort_order,
        caption
      )
      values (
        ${definition.id},
        ${inflectionTable.id},
        ${index},
        ${finalCaption && JSON.stringify(finalCaption)}
      )
    `;

    const customFormMap = await CustomFormMut.insert(
      tableId,
      inflectionTable.id,
      customForms
    );

    const derivedForms = await this.deriveAllForms(
      tableId,
      definition.term,
      definition.stemMap,
      inflectionTable.id,
      customFormMap
    );

    return {id: tableId, derivedForms};
  }

  public async update(
    id: number,
    definition: DefinitionData,
    {caption, customForms}: DefinitionInflectionTableInput,
    index: number
  ): Promise<DefinitionInflectionTableResult> {
    const {db} = this;
    const {DefinitionInflectionTable} = this.model;
    const {CustomFormMut} = this.mut;

    const table = await DefinitionInflectionTable.byIdRequired(id);
    if (table.definition_id !== definition.id) {
      throw new UserInputError(
        `Definition inflection table ${id} belongs to the wrong definition`,
        {invalidArgs: ['id']}
      );
    }

    await this.validateInflectionTableId(
      table.inflection_table_id,
      definition.partOfSpeechId
    );

    const finalCaption = validateTableCaption(caption);

    await db.exec`
      update definition_inflection_tables
      set
        caption = ${finalCaption && JSON.stringify(finalCaption)},
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
      table.inflection_table_id,
      customForms
    );

    const derivedForms = await this.deriveAllForms(
      table.id,
      definition.term,
      definition.stemMap,
      table.inflection_table_id,
      customFormMap
    );

    return {id, derivedForms};
  }

  private async validateInflectionTableId(
    inflectionTableId: number,
    partOfSpeechId: number
  ): Promise<InflectionTableRow> {
    const {InflectionTable} = this.model;

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
    return inflectionTable;
  }

  public async deriveAllForms(
    tableId: number,
    term: string,
    stemMap: Map<string, string>,
    inflectionTableId: number,
    customForms: Map<number, string>
  ): Promise<Map<number, string>> {
    const {InflectedForm} = this.model;

    const derivedForms = deriveForms(
      term,
      stemMap,
      await InflectedForm.allDerivableByTable(inflectionTableId)
    );

    customForms.forEach((formValue, formId) => {
      if (derivedForms.has(formId)) {
        derivedForms.set(formId, formValue);
      }
    });

    return derivedForms;
  }

  public async deleteOld(
    definitionId: number,
    currentIds: number[]
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
