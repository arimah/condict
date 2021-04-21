import {DataAccessor, DataReader, DataWriter} from '../../database';
import {MultiMap} from '../../utils';
import {validateDescription} from '../../rich-text';
import {
  DefinitionId,
  DefinitionInflectionTableId,
  PartOfSpeechId,
  InflectedFormId,
  InflectionTableLayoutId,
  BlockElementInput,
  NewDefinitionInput,
  EditDefinitionInput,
  EditDefinitionInflectionTableInput,
} from '../../graphql';

import {Language} from '../language';
import {Definition} from '../definition';
import {PartOfSpeech} from '../part-of-speech';
import {InflectionTableLayoutMut} from '../inflection-table';
import {LemmaMut, validateTerm} from '../lemma';
import FieldSet from '../field-set';

import {DefinitionRow} from './types';
import DefinitionStemMut from './stem-mut';
import DefinitionInflectionTableMut, {DefinitionData} from './table-mut';
import DefinitionTagMut from './tag-mut';
import DerivedDefinitionMut from './derived-mut';

const DefinitionMut = {
  async insert(
    db: DataAccessor,
    data: NewDefinitionInput
  ): Promise<DefinitionRow> {
    const {
      languageId,
      term,
      partOfSpeechId,
      description,
      stems,
      inflectionTables,
      tags,
    } = data;

    const language = await Language.byIdRequired(
      db,
      languageId,
      'languageId'
    );
    const partOfSpeech = await PartOfSpeech.byIdRequired(
      db,
      partOfSpeechId,
      'partOfSpeechId'
    );
    const validTerm = validateTerm(term);

    return db.transact(async db => {
      const lemmaId = LemmaMut.ensureExists(db, language.id, validTerm);

      const {insertId: definitionId} = db.exec<DefinitionId>`
        insert into definitions (lemma_id, language_id, part_of_speech_id)
        values (${lemmaId}, ${language.id}, ${partOfSpeech.id})
      `;

      DefinitionDescriptionMut.insert(db, definitionId, description);
      const stemMap = DefinitionStemMut.insert(db, definitionId, stems);

      const derivedDefinitions = await this.updateInflectionTables(
        db,
        definitionId,
        partOfSpeech.id,
        term,
        stemMap,
        inflectionTables,
        true
      );

      DefinitionTagMut.insertAll(db, definitionId, tags);

      DerivedDefinitionMut.insertAll(
        db,
        language.id,
        definitionId,
        derivedDefinitions
      );

      return Definition.byIdRequired(db, definitionId);
    });
  },

  async update(
    db: DataAccessor,
    id: DefinitionId,
    data: EditDefinitionInput
  ): Promise<DefinitionRow> {
    const {
      term,
      partOfSpeechId,
      description,
      stems,
      tags,
    } = data;
    let {inflectionTables} = data;

    const definition = await Definition.byIdRequired(db, id);

    return db.transact(async db => {
      const newFields = new FieldSet<DefinitionRow>();

      const actualTerm = this.updateTerm(db, definition, term, newFields);
      const actualPartOfSpeechId = await this.updatePartOfSpeech(
        db,
        definition,
        partOfSpeechId,
        newFields
      );
      // If the part of speech is changed, we can't keep the old inflection
      // tables, since they belong to the wrong part of speech. If no new
      // tables were provided, delete the old ones.
      if (
        actualPartOfSpeechId !== definition.part_of_speech_id &&
        inflectionTables == null
      ) {
        inflectionTables = [];
      }

      if (newFields.hasValues) {
        db.exec`
          update definitions
          set ${newFields}
          where id = ${definition.id}
        `;
      }

      if (description) {
        DefinitionDescriptionMut.update(db, definition.id, description);
      }

      const stemMap = await DefinitionStemMut.update(db, definition.id, stems);

      await this.updateInflectionTablesAndForms(
        db,
        definition,
        actualPartOfSpeechId,
        actualTerm,
        stemMap,
        inflectionTables,
        // If the term or stems have changed, we have to rederive all forms
        // for this definition.
        term !== definition.term || stems != null
      );

      if (tags) {
        DefinitionTagMut.update(db, definition.id, tags);
      }

      // If the derived definitions or term have changed, we may have orphaned
      // one or more lemmas, so we have to delete them too.
      LemmaMut.deleteEmpty(db, definition.language_id);

      db.clearCache(Definition.byIdKey, definition.id);
      return Definition.byIdRequired(db, definition.id);
    });
  },

  updateTerm(
    db: DataWriter,
    definition: DefinitionRow,
    term: string | undefined | null,
    newFields: FieldSet<DefinitionRow>
  ): string {
    if (term != null && term !== definition.term) {
      const validTerm = validateTerm(term);
      const newLemmaId = LemmaMut.ensureExists(
        db,
        definition.language_id,
        validTerm
      );
      newFields.set('lemma_id', newLemmaId);
      return validTerm;
    } else {
      return definition.term;
    }
  },

  async updatePartOfSpeech(
    db: DataWriter,
    definition: DefinitionRow,
    partOfSpeechId: PartOfSpeechId | undefined | null,
    newFields: FieldSet<DefinitionRow>
  ): Promise<PartOfSpeechId> {
    if (
      partOfSpeechId != null &&
      partOfSpeechId !== definition.part_of_speech_id
    ) {
      const partOfSpeech = await PartOfSpeech.byIdRequired(
        db,
        partOfSpeechId,
        'partOfSpeechId'
      );

      newFields.set('part_of_speech_id', partOfSpeech.id);
      return partOfSpeech.id;
    } else {
      return definition.part_of_speech_id;
    }
  },

  async delete(db: DataAccessor, id: DefinitionId): Promise<boolean> {
    // We need the language ID
    const definition = await Definition.byId(db, id);
    if (!definition) {
      return false;
    }

    await db.transact(db => {
      db.exec`
        delete from definitions
        where id = ${id}
      `;
      LemmaMut.deleteEmpty(db, definition.language_id);
    });
    return true;
  },

  async updateInflectionTablesAndForms(
    db: DataWriter,
    definition: DefinitionRow,
    partOfSpeechId: PartOfSpeechId,
    term: string,
    stemMap: Map<string, string>,
    inflectionTables: EditDefinitionInflectionTableInput[] | undefined | null,
    newFormsNeeded: boolean
  ): Promise<void> {
    let derivedDefinitions: MultiMap<string, InflectedFormId> | null = null;
    if (inflectionTables) {
      derivedDefinitions = await this.updateInflectionTables(
        db,
        definition.id,
        partOfSpeechId,
        term,
        stemMap,
        inflectionTables,
        false
      );
    } else if (newFormsNeeded) {
      derivedDefinitions = this.rederiveAllForms(
        db,
        definition.id,
        term,
        stemMap
      );
    }

    if (derivedDefinitions) {
      DerivedDefinitionMut.deleteAll(db, definition.id);
      DerivedDefinitionMut.insertAll(
        db,
        definition.language_id,
        definition.id,
        derivedDefinitions
      );
    }

    if (inflectionTables) {
      // We my have caused any number of old layouts to become disused now,
      // so clear them out of the database.
      // Note: We must do this here, not at the end of updateInflectionTables,
      // as we have to wait for new derived definitions to be inserted.
      InflectionTableLayoutMut.deleteObsolete(db);
    }
  },

  async updateInflectionTables(
    db: DataWriter,
    definitionId: DefinitionId,
    partOfSpeechId: PartOfSpeechId,
    term: string,
    stemMap: Map<string, string>,
    inflectionTables: EditDefinitionInflectionTableInput[],
    isNewDefinition: boolean
  ): Promise<MultiMap<string, InflectedFormId>> {
    const derivedDefinitions = new MultiMap<string, InflectedFormId>();

    const definitionData: DefinitionData = {
      id: definitionId,
      term,
      stemMap,
      partOfSpeechId,
    };

    const currentTableIds: DefinitionInflectionTableId[] = [];
    for (const table of inflectionTables) {
      const {id: tableId, derivedForms} = await (
        table.id != null && !isNewDefinition
          ? DefinitionInflectionTableMut.update(
            db,
            table.id,
            definitionData,
            table,
            currentTableIds.length
          )
          : DefinitionInflectionTableMut.insert(
            db,
            definitionData,
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
      DefinitionInflectionTableMut.deleteOld(
        db,
        definitionId,
        currentTableIds
      );
    }

    return derivedDefinitions;
  },

  rederiveAllForms(
    db: DataWriter,
    definitionId: DefinitionId,
    term: string,
    stemMap: Map<string, string>
  ): MultiMap<string, InflectedFormId> {
    // FIXME: https://github.com/typescript-eslint/typescript-eslint/issues/2452
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type Row = {
      id: DefinitionInflectionTableId;
      inflection_table_version_id: InflectionTableLayoutId;
    };

    const derivedDefinitions = new MultiMap<string, InflectedFormId>();

    const definitionTables = db.all<Row>`
      select id, inflection_table_version_id
      from definition_inflection_tables
      where definition_id = ${definitionId}
    `;
    const customForms = this.fetchAllCustomForms(
      db,
      definitionTables.map(t => t.id)
    );

    for (const table of definitionTables) {
      const derivedForms = DefinitionInflectionTableMut.deriveAllForms(
        db,
        table.id,
        term,
        stemMap,
        table.inflection_table_version_id,
        customForms.get(table.id) || new Map()
      );

      // Add each form as a derived definition. So derivative.
      derivedForms.forEach((term, formId) =>
        derivedDefinitions.add(term, formId)
      );
    }

    return derivedDefinitions;
  },

  fetchAllCustomForms(
    db: DataReader,
    definitionTableIds: DefinitionInflectionTableId[]
  ): Map<DefinitionInflectionTableId, Map<InflectedFormId, string>> {
    // FIXME: https://github.com/typescript-eslint/typescript-eslint/issues/2452
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type Row = {
      parent_id: DefinitionInflectionTableId;
      inflected_form_id: InflectedFormId;
      value: string;
    };

    const allCustomForms = db.all<Row>`
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
      let forms = map.get(row.parent_id);
      if (!forms) {
        forms = new Map();
        map.set(row.parent_id, forms);
      }
      forms.set(row.inflected_form_id, row.value);
      return map;
    }, new Map<DefinitionInflectionTableId, Map<InflectedFormId, string>>());
  },
} as const;

const DefinitionDescriptionMut = {
  insert(
    db: DataWriter,
    definitionId: DefinitionId,
    description: BlockElementInput[]
  ): void {
    const finalDescription = validateDescription(description, () => { /* ignore */ });

    db.exec`
      insert into definition_descriptions (definition_id, description)
      values (${definitionId}, ${JSON.stringify(finalDescription)})
    `;
  },

  update(
    db: DataWriter,
    definitionId: DefinitionId,
    description: BlockElementInput[]
  ): void {
    const finalDescription = validateDescription(description, () => { /* ignore */ });

    db.exec`
      update definition_descriptions
      set description = ${JSON.stringify(finalDescription)}
      where definition_id = ${definitionId}
    `;
  },
} as const;

export {
  DefinitionMut,
  DefinitionDescriptionMut,
};
