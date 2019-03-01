const {UserInputError} = require('apollo-server');

const inflectWord = require('../../utils/inflect-word');
const MultiMap = require('../../utils/multi-map');
const {
  validateDescription,
  validateTableCaption,
} = require('../../rich-text/validate');

const Mutator = require('../mutator');
const validator = require('../validator');
const FieldSet = require('../field-set');

const stemNameValidator = validator('name').lengthBetween(1, 32);
const stemValueValidator = validator('value').lengthBetween(0, 160);

const formValueValidator = validator('value').lengthBetween(0, 160);

const buildStems = stems =>
  stems.map(stem => ({
    name: stemNameValidator.validate(stem.name),
    value: stemValueValidator.validate(stem.value),
  }));

const deriveForms = (term, stems, derivableForms) => {
  // Mapping from inflected form ID to term.
  const derivedForms = new Map();

  // Find all the forms contained in the table, and derive forms for them!
  for (const form of derivableForms) {
    const inflectedWord = inflectWord(
      term,
      stems,
      form.inflection_pattern
    );
    derivedForms.set(form.id, inflectedWord);
  }

  return derivedForms;
};

class DefinitionMut extends Mutator {
  async insert({
    languageId,
    term,
    partOfSpeechId,
    description,
    stems,
    inflectionTables
  }) {
    const {db} = this;
    const {Language, Definition, PartOfSpeech} = this.model;
    const {
      LemmaMut,
      DefinitionDescriptionMut,
      DefinitionStemMut,
      DerivedDefinitionMut
    } = this.mut;

    const language = await Language.byIdRequired(languageId, 'languageId');
    const partOfSpeech = await PartOfSpeech.byIdRequired(
      partOfSpeechId,
      'partOfSpeechId'
    );

    const finalStems = buildStems(stems);
    const stemMap = new Map(
      finalStems.map(stem => [stem.name, stem.value])
    );

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

      return Definition.byId(definitionId);
    });
  }

  async update(id, {
    term,
    partOfSpeechId,
    description,
    stems,
    inflectionTables
  }) {
    const {db} = this;
    const {Definition, DefinitionStem, PartOfSpeech} = this.model;
    const {
      LemmaMut,
      DefinitionStemMut,
      DefinitionDescriptionMut,
      DerivedDefinitionMut
    } = this.mut;

    const definition = await Definition.byIdRequired(id);

    return db.transact(async () => {
      const newFields = new FieldSet();

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

      if (
        partOfSpeechId != null &&
        (partOfSpeechId | 0) !== definition.part_of_speech_id
      ) {
        const partOfSpeech = await PartOfSpeech.byIdRequired(
          partOfSpeechId,
          'partOfSpeechId'
        );

        newFields.set('part_of_speech_id', partOfSpeech.id);
        partOfSpeechId = partOfSpeech.id;

        // If the part of speech is changed, we can't keep the old inflection
        // tables, since they belong to the wrong part of speech. If no new
        // tables were provided, delete the old ones.
        if (inflectionTables == null) {
          inflectionTables = [];
        }
      } else {
        // A value is needed later for word inflection.
        partOfSpeechId = definition.part_of_speech_id;
      }

      if (newFields.size > 0) {
        await db.exec`
          update definitions
          set ${newFields}
          where id = ${definition.id}
        `;
      }

      if (description) {
        await DefinitionDescriptionMut.update(definition.id, description);
      }

      let stemMap;
      if (stems) {
        const finalStems = buildStems(stems);
        stemMap = new Map(
          finalStems.map(stem => [stem.name, stem.value])
        );
        await DefinitionStemMut.deleteAll(definition.id);
        await DefinitionStemMut.insert(definition.id, finalStems);
      } else {
        const currentStems = await DefinitionStem.allByDefinition(definition.id);
        stemMap = new Map(
          currentStems.map(stem => [stem.name, stem.value])
        );
      }

      let derivedDefinitions;
      if (inflectionTables) {
        derivedDefinitions = await this.updateInflectionTables(
          definition.id,
          partOfSpeechId,
          term,
          stemMap,
          inflectionTables,
          false
        );
      } else if (term !== definition.term || stems) {
        // If the term or stems have changed, we have to rederive all forms
        // for this definition.
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

      // If the derived definitions or term have changed, we may have orphaned
      // one or more lemmas, so we have to delete them too.
      await LemmaMut.deleteEmpty(definition.language_id);

      db.clearCache(Definition.byIdKey, definition.id);
      return Definition.byId(definition.id);
    });
  }

  async delete(id) {
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

  async updateInflectionTables(
    definitionId,
    partOfSpeechId,
    term,
    stemMap,
    inflectionTables,
    isNewDefinition
  ) {
    const {DefinitionInflectionTableMut} = this.mut;

    const derivedDefinitions = new MultiMap();

    const definitionData = {
      id: definitionId,
      term,
      stemMap,
    };

    const currentTableIds = [];
    for (const table of inflectionTables) {
      const {id: tableId, derivedForms} =
        table.id != null && !isNewDefinition
          ? await DefinitionInflectionTableMut.update(
            table.id,
            definitionData,
            partOfSpeechId,
            table,
            currentTableIds.length
          )
          : await DefinitionInflectionTableMut.insert(
            definitionData,
            partOfSpeechId,
            table,
            currentTableIds.length
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

  async rederiveAllForms(definitionId, term, stemMap) {
    const {db} = this;
    const {DefinitionInflectionTableMut} = this.mut;

    const derivedDefinitions = new MultiMap();

    const inflectionTables = await db.all`
      select id, inflection_table_id
      from definition_inflection_tables
      where definition_id = ${definitionId}
    `;
    const inflectionTableIds = inflectionTables.map(row => row.id);

    const customForms = (await db.all`
        select
          df.definition_inflection_table_id as parentId,
          df.inflected_form as value,
          dit.inflection_table_id as inflectionTableId
        from definition_forms df
        inner join definition_inflection_tables dit
          on dit.id = df.definition_inflection_table_id
        where df.definition_inflection_table_id in (${inflectionTableIds})
      `)
      .reduce((map, row) => {
        if (!map.has(row.parentId)) {
          map.set(row.parentId, [row]);
        } else {
          map.get(row.parentId).push(row);
        }
        return map;
      }, new Map());

    for (const table of inflectionTables) {
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
}

class DefinitionDescriptionMut extends Mutator {
  insert(definitionId, description) {
    description = validateDescription(description, () => {});

    return this.db.exec`
      insert into definition_descriptions (definition_id, description)
      values (${definitionId}, ${JSON.stringify(description)})
    `;
  }

  update(definitionId, description) {
    description = validateDescription(description, () => {});

    return this.db.exec`
      update definition_descriptions
      set description = ${JSON.stringify(description)}
      where definition_id = ${definitionId}
    `;
  }
}

class DefinitionStemMut extends Mutator {
  insert(definitionId, stems) {
    if (stems.length === 0) {
      return;
    }

    const {db} = this;

    const values = stems.map(s =>
      db.raw`(${definitionId}, ${s.name}, ${s.value})`
    );
    return db.exec`
      insert into definition_stems (definition_id, name, value)
      values ${values}
    `;
  }

  deleteAll(definitionId) {
    return this.db.exec`
      delete from definition_stems
      where definition_id = ${definitionId}
    `;
  }
}

class DefinitionInflectionTableMut extends Mutator {
  async insert(
    {id: definitionId, term, stemMap},
    partOfSpeechId,
    {inflectionTableId, caption, customForms},
    index
  ) {
    const {db} = this;

    const inflectionTable = await this.validateInflectionTableId(
      inflectionTableId,
      partOfSpeechId
    );
    caption = caption ? validateTableCaption(caption) : null;

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
        ${caption ? JSON.stringify(caption) : null}
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

  async update(
    id,
    {id: definitionId, term, stemMap},
    partOfSpeechId,
    {caption, customForms},
    index
  ) {
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

    caption = caption ? validateTableCaption(caption) : null;

    await db.exec`
      update definition_inflection_tables
      set
        caption = ${caption ? JSON.stringify(caption) : null},
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

  async validateInflectionTableId(inflectionTableId, partOfSpeechId) {
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

  async deriveAllForms(
    definitionInflectionTableId,
    term,
    stemMap,
    inflectionTableId,
    customForms
  ) {
    const {db} = this;
    const {InflectedForm} = this.model;

    const derivedForms = deriveForms(
      term,
      stemMap,
      await InflectedForm.allDerivableByTable(inflectionTableId)
    );

    for (const form of customForms) {
      const inflectedForm = await InflectedForm.byIdRequired(
        form.inflectedFormId,
        'inflectedFormId'
      );
      if (inflectedForm.inflection_table_id !== inflectionTableId) {
        throw new UserInputError(
          `Inflected form ${form.inflectedFormId} belongs to the wrong table`,
          {invalidArgs: ['inflectedFormId']}
        );
      }

      // If there is a derived form, override it with this custom form!
      if (derivedForms.has(inflectedForm.id)) {
        derivedForms.set(inflectedForm.id, form.value);
      }

      const value = formValueValidator.validate(form.value);

      await db.exec`
        insert into definition_forms (
          definition_inflection_table_id,
          inflected_form_id,
          inflected_form
        )
        values (
          ${definitionInflectionTableId},
          ${form.inflectedFormId},
          ${value}
        )
      `;
    }

    return derivedForms;
  }

  deleteOld(definitionId, currentIds) {
    const {db} = this;
    return db.exec`
      delete from definition_inflection_tables
      where definition_id = ${definitionId}
        and ${
          currentIds.length > 0
            ? db.raw`id not in (${currentIds})`
            : '1'
        }
    `;
  }
}

class DerivedDefinitionMut extends Mutator {
  async insertAll(languageId, originalDefinitionId, derivedDefinitions) {
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

  async insert(languageId, term, originalDefinitionId, inflectedFormId) {
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

  deleteAll(originalDefinitionId) {
    return this.db.exec`
      delete from derived_definitions
      where original_definition_id = ${originalDefinitionId}
    `;
  }
}

module.exports = {
  DefinitionMut,
  DefinitionDescriptionMut,
  DefinitionStemMut,
  DefinitionInflectionTableMut,
  DerivedDefinitionMut,
};
