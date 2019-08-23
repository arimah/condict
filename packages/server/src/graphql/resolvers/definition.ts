import {
  DefinitionRow,
  DefinitionStemRow,
  DefinitionInflectionTableRow,
  CustomInflectedFormRow,
  DerivedDefinitionRow,
} from '../../model/definition/types';

import {
  DefinitionId,
  DefinitionInflectionTableId,
  NewDefinitionInput,
  EditDefinitionInput,
} from '../types';
import {mutator} from '../helpers';

import {Resolvers, Mutators, IdArg, PageArg} from './types';

const Definition: Resolvers<DefinitionRow> = {
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

  tags: (p, _args, {model: {Tag}}) =>
    Tag.allByDefinition(p.id),

  derivedDefinitions: (p, {page}: PageArg, {model: {DerivedDefinition}}) =>
    DerivedDefinition.allByDerivedFrom(p.id, page),

  lemma: (p, _args, {model: {Lemma}}) =>
    Lemma.byId(p.lemma_id),

  language: (p, _args, {model: {Language}}) =>
    Language.byId(p.language_id),
};

const DefinitionStem: Resolvers<DefinitionStemRow> = {
  definition: (p, _args, {model: {Definition}}) =>
    Definition.byId(p.definition_id),
};

const DefinitionInflectionTable: Resolvers<DefinitionInflectionTableRow> = {
  caption: p => p.caption && JSON.parse(p.caption),

  captionRaw: p => p.caption,

  customForms: (p, _args, {model: {CustomInflectedForm}}) =>
    CustomInflectedForm.allByTable(p.id),

  inflectionTable: (p, _args, {model: {InflectionTable}}) =>
    InflectionTable.byId(p.inflection_table_id),

  inflectionTableLayout: (p, _args, {model: {InflectionTableLayout}}) =>
    InflectionTableLayout.byId(p.inflection_table_version_id),

  definition: (p, _args, {model: {Definition}}) =>
    Definition.byId(p.definition_id),
};

const CustomInflectedForm: Resolvers<CustomInflectedFormRow> = {
  table: (p, _args, {model: {DefinitionInflectionTable}}) =>
    DefinitionInflectionTable.byId(p.definition_inflection_table_id),

  inflectedForm: (p, _args, {model: {InflectedForm}}) =>
    InflectedForm.byId(p.inflected_form_id),

  value: p => p.inflected_form,
};

const DerivedDefinition: Resolvers<DerivedDefinitionRow> = {
  derivedFrom: (p, _args, {model: {Definition}}) =>
    Definition.byId(p.original_definition_id),

  inflectedForm: (p, _args, {model: {InflectedForm}}) =>
    InflectedForm.byId(p.inflected_form_id),

  lemma: (p, _args, {model: {Lemma}}) =>
    Lemma.byId(p.lemma_id),

  language: (p, _args, {model: {Language}}) =>
    Language.byId(p.language_id),
};

const Query: Resolvers<unknown> = {
  definition: (_root, {id}: IdArg<DefinitionId>, {model: {Definition}}) =>
    Definition.byId(id),

  definitionInflectionTable: (
    _root,
    {id}: IdArg<DefinitionInflectionTableId>,
    {model: {DefinitionInflectionTable}}
  ) =>
    DefinitionInflectionTable.byId(id),
};

type AddDefinitionArgs = {
  data: NewDefinitionInput;
};

type EditDefinitionArgs = {
  id: DefinitionId;
  data: EditDefinitionInput;
};

const Mutation: Mutators<unknown> = {
  addDefinition: mutator(
    (_root, {data}: AddDefinitionArgs, {mut: {DefinitionMut}}) =>
      DefinitionMut.insert(data)
  ),

  editDefinition: mutator(
    (_root, {id, data}: EditDefinitionArgs, {mut: {DefinitionMut}}) =>
      DefinitionMut.update(id, data)
  ),

  deleteDefinition: mutator(
    (_root, {id}: IdArg<DefinitionId>, {mut: {DefinitionMut}}) =>
      DefinitionMut.delete(id)
  ),
};

export default {
  Definition,
  DefinitionStem,
  DefinitionInflectionTable,
  CustomInflectedForm,
  DerivedDefinition,
  Query,
  Mutation,
};
