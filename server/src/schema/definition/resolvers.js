module.exports = {
  Definition: {
    partOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
      PartOfSpeech.byId(p.part_of_speech_id),

    async description(p, _args, {model: {DefinitionDescription}}) {
      const description = await DefinitionDescription.rawByDefinition(p.id);
      return JSON.parse(description);
    },

    descriptionRaw: (p, _args, {model: {DefinitionDescription}}) =>
      DefinitionDescription.rawByDefinition(p.id),

    stems: (p, _args, {model: {DefinitionStem}}) =>
      DefinitionStem.allByDefinition(p.id),

    inflectionTables: (p, _args, {model: {DefinitionInflectionTable}}) =>
      DefinitionInflectionTable.allByDefinition(p.id),

    derivedDefinitions: (p, _args, {model: {DerivedDefinition}}) =>
      DerivedDefinition.allByDerivedFrom(p.id),

    lemma: (p, _args, {model: {Lemma}}) =>
      Lemma.byId(p.lemma_id),

    language: (p, _args, {model: {Language}}) =>
      Language.byId(p.language_id),
  },

  DefinitionStem: {
    definition: (p, _args, {model: {Definition}}) =>
      Definition.byId(p.definition_id),
  },

  DefinitionInflectionTable: {
    caption: p => p.caption && JSON.parse(p.caption),

    captionRaw: p => p.caption,

    customForms: (p, _args, {model: {CustomInflectedForm}}) =>
      CustomInflectedForm.allByTable(p.id),

    inflectionTable: (p, _args, {model: {InflectionTable}}) =>
      InflectionTable.byId(p.inflection_table_id),

    definition: (p, _args, {model: {Definition}}) =>
      Definition.byId(p.definition_id),
  },

  CustomInflectedForm: {
    table: (p, _args, {model: {DefinitionInflectionTable}}) =>
      DefinitionInflectionTable.byId(p.definition_inflection_table_id),

    inflectedForm: (p, _args, {model: {InflectedForm}}) =>
      InflectedForm.byId(p.inflected_form_id),

    value: p => p.inflected_form,
  },

  DerivedDefinition: {
    derivedFrom: (p, _args, {model: {Definition}}) =>
      Definition.byId(p.original_definition_id),

    inflectedForm: (p, _args, {model: {InflectedForm}}) =>
      InflectedForm.byId(p.inflected_form_id),

    lemma: (p, _args, {model: {Lemma}}) =>
      Lemma.byId(p.lemma_id),

    language: (p, _args, {model: {Language}}) =>
      Language.byId(p.language_id),
  },

  Query: {
    definition: (_root, {id}, {model: {Definition}}) =>
      Definition.byId(id),

    definitionInflectionTable: (
      _root,
      {id},
      {model: {DefinitionInflectionTable}}
    ) =>
      DefinitionInflectionTable.byId(id),
  },

  Mutation: {
    addDefinition: (_root, {data}, {mut: {DefinitionMut}}) =>
      DefinitionMut.insert(data),

    editDefinition: (_root, {id, data}, {mut: {DefinitionMut}}) =>
      DefinitionMut.update(id, data),

    deleteDefinition: (_root, {id}, {mut: {DefinitionMut}}) =>
      DefinitionMut.delete(id),
  },
};
