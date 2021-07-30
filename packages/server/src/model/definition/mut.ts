import {DataReader, DataWriter} from '../../database';
import {MultiMap} from '../../utils';
import {
  DefinitionId,
  DefinitionInflectionTableId,
  PartOfSpeechId,
  InflectedFormId,
  InflectionTableLayoutId,
  NewDefinitionInput,
  EditDefinitionInput,
  EditDefinitionInflectionTableInput,
} from '../../graphql';

import {Language} from '../language';
import {Definition} from '../definition';
import {PartOfSpeech} from '../part-of-speech';
import {InflectionTableLayoutMut} from '../inflection-table';
import {DescriptionMut} from '../description';
import {LemmaMut, validateTerm} from '../lemma';
import {TagMut} from '../tag';
import {SearchIndexMut} from '../search-index';
import FieldSet from '../field-set';
import {MutContext, WriteContext} from '../types';

import {DefinitionRow} from './types';
import DefinitionStemMut from './stem-mut';
import DefinitionInflectionTableMut, {DefinitionData} from './table-mut';
import DefinitionTagMut from './tag-mut';
import DerivedDefinitionMut from './derived-mut';

const DefinitionMut = {
  async insert(
    context: MutContext,
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
      context.db,
      languageId,
      'languageId'
    );
    const partOfSpeech = await PartOfSpeech.byIdRequired(
      context.db,
      partOfSpeechId,
      'partOfSpeechId'
    );
    const validTerm = validateTerm(term);

    return MutContext.transact(context, async context => {
      const {db, events, logger} = context;
      logger.debug(`Begin creation of definition: term = ${validTerm}`);

      const lemmaId = LemmaMut.ensureExists(context, language.id, validTerm);

      const desc = DescriptionMut.insert(db, description);

      const now = Date.now();

      const {insertId: definitionId} = db.exec<DefinitionId>`
        insert into definitions (
          lemma_id,
          language_id,
          part_of_speech_id,
          description_id,
          time_created,
          time_updated
        )
        values (
          ${lemmaId},
          ${language.id},
          ${partOfSpeech.id},
          ${desc.id},
          ${now},
          ${now}
        )
      `;

      SearchIndexMut.insertDefinition(db, definitionId, desc.description);

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

      const tagIds = DefinitionTagMut.insertAll(context, definitionId, tags);

      DerivedDefinitionMut.insertAll(
        context,
        language.id,
        definitionId,
        derivedDefinitions
      );

      events.emit({
        type: 'definition',
        action: 'create',
        id: definitionId,
        lemmaId,
        languageId,
      });
      if (tagIds.length > 0) {
        events.emit({
          type: 'definitionTag',
          action: 'update',
          definitionId,
          lemmaId,
          languageId,
          nextTagIds: tagIds,
          prevTagIds: [],
        });
      }
      logger.verbose(`Definition created: ${definitionId}`);

      return Definition.byIdRequired(db, definitionId);
    });
  },

  async update(
    context: MutContext,
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

    const definition = await Definition.byIdRequired(context.db, id);

    return MutContext.transact(context, async context => {
      const {db, events, logger} = context;
      const newFields = new FieldSet<DefinitionRow>();

      logger.debug(`Begin update of definition: ${definition.id}`);

      newFields.set('time_updated', Date.now());
      const actualTerm = this.updateTerm(context, definition, term, newFields);
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
        logger.debug(
          'Clearing inflection tables: part of speech changed, but has no new tables given'
        );
      }

      db.exec`
        update definitions
        set ${newFields}
        where id = ${definition.id}
      `;

      if (description) {
        const desc = DescriptionMut.update(
          db,
          definition.description_id,
          description
        );
        SearchIndexMut.updateDefinition(db, definition.id, desc.description);
      }

      const stemMap = await DefinitionStemMut.update(db, definition.id, stems);

      await this.updateInflectionTablesAndForms(
        context,
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
        const [prevTagIds, nextTagIds] = DefinitionTagMut.update(
          context,
          definition.id,
          tags
        );
        events.emit({
          type: 'definitionTag',
          action: 'update',
          definitionId: definition.id,
          lemmaId: newFields.get('lemma_id') ?? definition.lemma_id,
          languageId: definition.language_id,
          prevTagIds,
          nextTagIds,
        });
      }

      // If the derived definitions or term have changed, we may have orphaned
      // one or more lemmas, so we have to delete them too.
      LemmaMut.deleteEmpty(context, definition.language_id);

      events.emit({
        type: 'definition',
        action: 'update',
        id: definition.id,
        lemmaId: newFields.get('lemma_id') ?? definition.lemma_id,
        prevLemmaId: definition.lemma_id,
        languageId: definition.language_id,
      });
      logger.verbose(`Definition updated: ${definition.id}`);

      db.clearCache(Definition.byIdKey, definition.id);
      return Definition.byIdRequired(db, definition.id);
    });
  },

  updateTerm(
    context: WriteContext,
    definition: DefinitionRow,
    term: string | undefined | null,
    newFields: FieldSet<DefinitionRow>
  ): string {
    if (term != null && term !== definition.term) {
      const validTerm = validateTerm(term);
      const newLemmaId = LemmaMut.ensureExists(
        context,
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

  async delete(context: MutContext, id: DefinitionId): Promise<boolean> {
    // We need the language, lemma and description ID
    const definition = await Definition.byId(context.db, id);
    if (!definition) {
      return false;
    }

    await MutContext.transact(context, context => {
      const {db, events, logger} = context;
      logger.debug(`Begin deletion of definition: ${definition.id}`);

      const prevTagIds = DefinitionTagMut.deleteAll(db, definition.id);
      if (prevTagIds.length > 0) {
        // We may have orphaned a number of tags, so we need to delete those.
        TagMut.deleteOrphaned(context);
      }

      db.exec`
        delete from definitions
        where id = ${id}
      `;

      DescriptionMut.delete(db, definition.description_id);

      SearchIndexMut.deleteDefinition(db, definition.id);

      LemmaMut.deleteEmpty(context, definition.language_id);

      events.emit({
        type: 'definition',
        action: 'delete',
        id: definition.id,
        lemmaId: definition.lemma_id,
        languageId: definition.language_id,
      });
      if (prevTagIds.length > 0) {
        events.emit({
          type: 'definitionTag',
          action: 'update',
          definitionId: definition.id,
          lemmaId: definition.lemma_id,
          languageId: definition.language_id,
          prevTagIds,
          nextTagIds: [],
        });
      }
      logger.verbose(`Definition deleted: ${definition.id}`);
    });
    return true;
  },

  async updateInflectionTablesAndForms(
    context: WriteContext,
    definition: DefinitionRow,
    partOfSpeechId: PartOfSpeechId,
    term: string,
    stemMap: Map<string, string>,
    inflectionTables: EditDefinitionInflectionTableInput[] | undefined | null,
    newFormsNeeded: boolean
  ): Promise<void> {
    const {db, logger} = context;

    let derivedDefinitions: MultiMap<string, InflectedFormId> | null = null;
    if (inflectionTables) {
      logger.debug('Updating inflection tables: new tables given');
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
      logger.debug('Recomputing derived definitions: term or stems changed');
      derivedDefinitions = this.rederiveAllForms(
        db,
        definition.id,
        term,
        stemMap
      );
    }

    if (derivedDefinitions) {
      logger.debug(
        `Rebuilding derived definitions: count = ${derivedDefinitions.getTotalSize()}`
      );
      DerivedDefinitionMut.deleteAll(db, definition.id);
      DerivedDefinitionMut.insertAll(
        context,
        definition.language_id,
        definition.id,
        derivedDefinitions
      );
    }

    if (inflectionTables) {
      // We may have caused any number of old layouts to become disused now,
      // so clear them out of the database.
      // Note: We must do this here, not at the end of updateInflectionTables,
      // as we have to wait for new derived definitions to be inserted.
      InflectionTableLayoutMut.deleteObsolete(context);
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

export {DefinitionMut};
