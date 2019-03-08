import {UserInputError} from 'apollo-server';

import MultiMap from '../../utils/multi-map';
import {BlockElementInput, InlineElementInput} from '../../rich-text/types';
import {
  validateDescription,
  validateTableCaption,
} from '../../rich-text/validate';

import Mutator from '../mutator';
import FieldSet from '../field-set';
import {InflectionTableRow} from '../inflection-table/model';

import {DefinitionRow} from './model';
import {
  validateStems,
  validateFormValue,
} from './validators';
import deriveForms from './derive-forms';

export interface NewDefinitionInput {
  languageId: string;
  term: string;
  partOfSpeechId: string;
  description: BlockElementInput[];
  stems: StemInput[];
  inflectionTables: DefinitionInflectionTableInput[];
}

export interface EditDefinitionInput {
  term?: string | null;
  partOfSpeechId?: string | null;
  description?: BlockElementInput[] | null;
  stems?: StemInput[] | null;
  inflectionTables?: DefinitionInflectionTableInput[] | null;
}

export interface StemInput {
  name: string;
  value: string;
}

export interface DefinitionInflectionTableInput {
  id?: string | null;
  caption?: TableCaptionInput | null;
  customForms: CustomInflectedFormInput[];
  inflectionTableId: string;
}

export interface TableCaptionInput {
  text: string;
  inlines?: InlineElementInput[] | null;
}

export interface CustomInflectedFormInput {
  inflectedFormId: string;
  value: string;
}

interface DefinitionData {
  id: number;
  term: string;
  stemMap: Map<string, string>;
}

const buildStemMap = (stems: StemInput[]) => new Map<string, string>(
  stems.map<[string, string]>(stem => [stem.name, stem.value])
);

class DefinitionMut extends Mutator {
  public async insert({
    languageId,
    term,
    partOfSpeechId,
    description,
    stems,
    inflectionTables
  }: NewDefinitionInput): Promise<DefinitionRow> {
    const {db} = this;
    const {Language, Definition, PartOfSpeech} = this.model;
    const {
      LemmaMut,
      DefinitionDescriptionMut,
      DefinitionStemMut,
      DerivedDefinitionMut
    } = this.mut;

    const language = await Language.byIdRequired(+languageId, 'languageId');
    const partOfSpeech = await PartOfSpeech.byIdRequired(
      +partOfSpeechId,
      'partOfSpeechId'
    );

    const finalStems = validateStems(stems);
    const stemMap = buildStemMap(finalStems);

    return db.transact(async () => {
      const lemmaId = await LemmaMut.ensureExists(language.id, term);

      const {insertId: definitionId} = await db.exec`
        insert into definitions (lemma_id, language_id, part_of_speech_id)
        values (${lemmaId}, ${language.id}, ${partOfSpeech.id})
      `;
      await DefinitionDescriptionMut.insert(definitionId, description);
      await DefinitionStemMut.insert(definitionId, finalStems);

      const derivedDefinitions = await this.updateInflectionTables(
        definitionId,
        partOfSpeech.id,
        term,
        stemMap,
        inflectionTables,
        true
      );

      await DerivedDefinitionMut.insertAll(
        language.id,
        definitionId,
        derivedDefinitions
      );

      return Definition.byIdRequired(definitionId);
    });
  }

  public async update(id: number, {
    term,
    partOfSpeechId,
    description,
    stems,
    inflectionTables
  }: EditDefinitionInput): Promise<DefinitionRow> {
    const {db} = this;
    const {Definition, PartOfSpeech} = this.model;
    const {
      LemmaMut,
      DefinitionStemMut,
      DefinitionDescriptionMut
    } = this.mut;

    const definition = await Definition.byIdRequired(id);

    return db.transact(async () => {
      const newFields = new FieldSet<DefinitionRow>();

      if (term != null && term !== definition.term) {
        const newLemmaId = await LemmaMut.ensureExists(
          definition.language_id,
          term
        );
        newFields.set('lemma_id', newLemmaId);
      } else {
        // A value is needed later for word inflection.
        term = definition.term;
      }

      let actualPartOfSpeechId: number;
      if (
        partOfSpeechId != null &&
        +partOfSpeechId !== definition.part_of_speech_id
      ) {
        const partOfSpeech = await PartOfSpeech.byIdRequired(
          +partOfSpeechId,
          'partOfSpeechId'
        );

        newFields.set('part_of_speech_id', partOfSpeech.id);
        actualPartOfSpeechId = partOfSpeech.id;

        // If the part of speech is changed, we can't keep the old inflection
        // tables, since they belong to the wrong part of speech. If no new
        // tables were provided, delete the old ones.
        if (inflectionTables == null) {
          inflectionTables = [];
        }
      } else {
        // A value is needed later for word inflection.
        actualPartOfSpeechId = definition.part_of_speech_id;
      }

      if (newFields.hasValues) {
        await db.exec`
          update definitions
          set ${newFields}
          where id = ${definition.id}
        `;
      }

      if (description) {
        await DefinitionDescriptionMut.update(definition.id, description);
      }

      const stemMap = await DefinitionStemMut.update(definition.id, stems);

      await this.updateInflectionTablesAndForms(
        definition,
        actualPartOfSpeechId,
        term,
        stemMap,
        inflectionTables,
        // If the term or stems have changed, we have to rederive all forms
        // for this definition.
        term !== definition.term || stems != null
      );

      // If the derived definitions or term have changed, we may have orphaned
      // one or more lemmas, so we have to delete them too.
      await LemmaMut.deleteEmpty(definition.language_id);

      db.clearCache(Definition.byIdKey, definition.id);
      return Definition.byIdRequired(definition.id);
    });
  }

  public async delete(id: number): Promise<boolean> {
    const {Definition} = this.model;
    const {LemmaMut} = this.mut;

    // We need the language ID
    const definition = await Definition.byId(id);
    if (!definition) {
      return false;
    }

    await this.db.exec`
      delete from definitions
      where id = ${id}
    `;
    await LemmaMut.deleteEmpty(definition.language_id);
    return true;
  }

  private async updateInflectionTablesAndForms(
    definition: DefinitionRow,
    partOfSpeechId: number,
    term: string,
    stemMap: Map<string, string>,
    inflectionTables: DefinitionInflectionTableInput[] | undefined | null,
    newFormsNeeded: boolean
  ): Promise<void> {
    const {DerivedDefinitionMut} = this.mut;

    let derivedDefinitions: MultiMap<string, number> | null = null;
    if (inflectionTables) {
      derivedDefinitions = await this.updateInflectionTables(
        definition.id,
        partOfSpeechId,
        term,
        stemMap,
        inflectionTables,
        false
      );
    } else if (newFormsNeeded) {
      derivedDefinitions = await this.rederiveAllForms(
        definition.id,
        term,
        stemMap
      );
    }

    if (derivedDefinitions) {
      await DerivedDefinitionMut.deleteAll(definition.id);
      await DerivedDefinitionMut.insertAll(
        definition.language_id,
        definition.id,
        derivedDefinitions
      );
    }
  }

  private async updateInflectionTables(
    definitionId: number,
    partOfSpeechId: number,
    term: string,
    stemMap: Map<string, string>,
    inflectionTables: DefinitionInflectionTableInput[],
    isNewDefinition: boolean
  ): Promise<MultiMap<string, number>> {
    const {DefinitionInflectionTableMut} = this.mut;

    const derivedDefinitions = new MultiMap<string, number>();

    const definitionData: DefinitionData = {
      id: definitionId,
      term,
      stemMap,
    };

    const currentTableIds: number[] = [];
    for (const table of inflectionTables) {
      interface Result {
        id: number;
        derivedForms: Map<number, string>;
      };
      const {id: tableId, derivedForms}: Result = await (
        table.id != null && !isNewDefinition
          ? DefinitionInflectionTableMut.update(
            +table.id,
            definitionData,
            partOfSpeechId,
            table,
            currentTableIds.length
          )
          : DefinitionInflectionTableMut.insert(
            definitionData,
            partOfSpeechId,
            table,
            currentTableIds.length
          )
      );

      // Add each form as a derived definition. So derivative.
      derivedForms.forEach((term, formId) =>
        derivedDefinitions.add(term, formId)
      );

      currentTableIds.push(tableId);
    }

    if (!isNewDefinition) {
      await DefinitionInflectionTableMut.deleteOld(
        definitionId,
        currentTableIds
      );
    }

    return derivedDefinitions;
  }

  private async rederiveAllForms(
    definitionId: number,
    term: string,
    stemMap: Map<string, string>
  ): Promise<MultiMap<string, number>> {
    interface Row {
      id: number;
      inflection_table_id: number;
    };

    const {db} = this;
    const {DefinitionInflectionTableMut} = this.mut;

    const derivedDefinitions = new MultiMap<string, number>();

    const definitionTables = await db.all<Row>`
      select id, inflection_table_id
      from definition_inflection_tables
      where definition_id = ${definitionId}
    `;
    const customForms = await this.fetchAllCustomForms(
      definitionTables.map(t => t.id)
    );

    for (const table of definitionTables) {
      const derivedForms = await DefinitionInflectionTableMut.deriveAllForms(
        table.id,
        term,
        stemMap,
        table.inflection_table_id,
        customForms.get(table.id) || []
      );

      // Add each form as a derived definition. So derivative.
      derivedForms.forEach((term, formId) =>
        derivedDefinitions.add(term, formId)
      );
    }

    return derivedDefinitions;
  }

  private async fetchAllCustomForms(
    definitionTableIds: number[]
  ): Promise<Map<number, CustomInflectedFormInput[]>> {
    interface Row {
      parent_id: number;
      inflected_form_id: number;
      value: string;
    }

    const {db} = this;

    const allCustomForms = await db.all<Row>`
      select
        df.definition_inflection_table_id as parent_id,
        df.inflected_form_id,
        df.inflected_form as value
      from definition_forms df
      inner join definition_inflection_tables dit
        on dit.id = df.definition_inflection_table_id
      where df.definition_inflection_table_id in (${definitionTableIds})
    `;

    return allCustomForms.reduce((map, row) => {
      const form: CustomInflectedFormInput = {
        inflectedFormId: String(row.inflected_form_id),
        value: row.value,
      };

      const forms = map.get(row.parent_id);
      if (forms) {
        forms.push(form);
      } else {
        map.set(row.parent_id, [form]);
      }
      return map;
    }, new Map<number, CustomInflectedFormInput[]>());
  }
}

interface DefinitionInflectionTableResult {
  id: number;
  derivedForms: Map<number, string>;
}

class DefinitionInflectionTableMut extends Mutator {
  public async insert(
    {id: definitionId, term, stemMap}: DefinitionData,
    partOfSpeechId: number,
    {inflectionTableId, caption, customForms}: DefinitionInflectionTableInput,
    index: number
  ): Promise<DefinitionInflectionTableResult> {
    const {db} = this;

    const inflectionTable = await this.validateInflectionTableId(
      +inflectionTableId,
      partOfSpeechId
    );
    const finalCaption = caption ? validateTableCaption(caption) : null;

    const {insertId: tableId} = await db.exec`
      insert into definition_inflection_tables (
        definition_id,
        inflection_table_id,
        sort_order,
        caption
      )
      values (
        ${definitionId},
        ${inflectionTable.id},
        ${index},
        ${finalCaption ? JSON.stringify(finalCaption) : null}
      )
    `;

    const derivedForms = await this.deriveAllForms(
      tableId,
      term,
      stemMap,
      inflectionTable.id,
      customForms
    );

    return {id: tableId, derivedForms};
  }

  public async update(
    id: number,
    {id: definitionId, term, stemMap}: DefinitionData,
    partOfSpeechId: number,
    {caption, customForms}: DefinitionInflectionTableInput,
    index: number
  ): Promise<DefinitionInflectionTableResult> {
    const {db} = this;
    const {DefinitionInflectionTable} = this.model;

    const table = await DefinitionInflectionTable.byIdRequired(id);
    if (table.definition_id !== definitionId) {
      throw new UserInputError(
        `Definition inflection table ${id} belongs to the wrong definition`,
        {invalidArgs: ['id']}
      );
    }

    await this.validateInflectionTableId(
      table.inflection_table_id,
      partOfSpeechId
    );

    const finalCaption = caption ? validateTableCaption(caption) : null;

    await db.exec`
      update definition_inflection_tables
      set
        caption = ${finalCaption ? JSON.stringify(finalCaption) : null},
        sort_order = ${index}
      where id = ${table.id}
    `;
    db.clearCache(DefinitionInflectionTable.byIdKey, table.id);

    // We could compute a derived_forms delta, but it's kind of messy.
    // It's much easier to just delete all old forms and insert the new.
    // This all happens inside a transaction anyway.
    await db.exec`
      delete from definition_forms
      where definition_inflection_table_id = ${id}
    `;

    const derivedForms = await this.deriveAllForms(
      table.id,
      term,
      stemMap,
      table.inflection_table_id,
      customForms
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
    definitionInflectionTableId: number,
    term: string,
    stemMap: Map<string, string>,
    inflectionTableId: number,
    customForms: CustomInflectedFormInput[]
  ): Promise<Map<number, string>> {
    const {db} = this;
    const {InflectedForm} = this.model;

    const derivedForms = deriveForms(
      term,
      stemMap,
      await InflectedForm.allDerivableByTable(inflectionTableId)
    );

    for (const form of customForms) {
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

      // If there is a derived form, override it with this custom form!
      if (derivedForms.has(inflectedForm.id)) {
        derivedForms.set(inflectedForm.id, form.value);
      }

      const value = validateFormValue(form.value);

      await db.exec`
        insert into definition_forms (
          definition_inflection_table_id,
          inflected_form_id,
          inflected_form
        )
        values (
          ${definitionInflectionTableId},
          ${inflectedForm.id},
          ${value}
        )
      `;
    }

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

class DefinitionDescriptionMut extends Mutator {
  public async insert(
    definitionId: number,
    description: BlockElementInput[]
  ): Promise<void> {
    const finalDescription = validateDescription(description, () => {});

    await this.db.exec`
      insert into definition_descriptions (definition_id, description)
      values (${definitionId}, ${JSON.stringify(finalDescription)})
    `;
  }

  public async update(
    definitionId: number,
    description: BlockElementInput[]
  ): Promise<void> {
    const finalDescription = validateDescription(description, () => {});

    await this.db.exec`
      update definition_descriptions
      set description = ${JSON.stringify(finalDescription)}
      where definition_id = ${definitionId}
    `;
  }
}

class DefinitionStemMut extends Mutator {
  public async insert(
    definitionId: number,
    stems: StemInput[]
  ): Promise<void> {
    if (stems.length === 0) {
      return;
    }

    const {db} = this;

    await db.exec`
      insert into definition_stems (definition_id, name, value)
      values ${stems.map(s =>
        db.raw`(${definitionId}, ${s.name}, ${s.value})`
      )}
    `;
  }

  public async update(
    definitionId: number,
    stems: StemInput[] | undefined | null
  ): Promise<Map<string, string>> {
    const {DefinitionStem} = this.model;

    let stemMap: Map<string, string>;
    if (stems) {
      const finalStems = validateStems(stems);
      stemMap = buildStemMap(finalStems);
      await this.deleteAll(definitionId);
      await this.insert(definitionId, finalStems);
    } else {
      const currentStems = await DefinitionStem.allByDefinition(definitionId);
      stemMap = buildStemMap(currentStems);
    }

    return stemMap;
  }

  public async deleteAll(definitionId: number): Promise<void> {
    await this.db.exec`
      delete from definition_stems
      where definition_id = ${definitionId}
    `;
  }
}

class DerivedDefinitionMut extends Mutator {
  public async insertAll(
    languageId: number,
    originalDefinitionId: number,
    derivedDefinitions: MultiMap<string, number>
  ): Promise<void> {
    for (const [term, inflectedFormId] of derivedDefinitions) {
      if (!term) {
        // Can't add an empty term – just skip these.
        continue;
      }
      await this.insert(
        languageId,
        term,
        originalDefinitionId,
        inflectedFormId
      );
    }
  }

  public async insert(
    languageId: number,
    term: string,
    originalDefinitionId: number,
    inflectedFormId: number
  ): Promise<void> {
    const {LemmaMut} = this.mut;

    const lemmaId = await LemmaMut.ensureExists(languageId, term);

    await this.db.exec`
      insert into derived_definitions (
        lemma_id,
        original_definition_id,
        inflected_form_id
      )
      values (${lemmaId}, ${originalDefinitionId}, ${inflectedFormId})
    `;
  }

  public async deleteAll(originalDefinitionId: number): Promise<void> {
    await this.db.exec`
      delete from derived_definitions
      where original_definition_id = ${originalDefinitionId}
    `;
  }
}

export default {
  DefinitionMut,
  DefinitionDescriptionMut,
  DefinitionStemMut,
  DefinitionInflectionTableMut,
  DerivedDefinitionMut,
};
