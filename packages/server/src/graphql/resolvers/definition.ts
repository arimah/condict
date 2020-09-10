import {
  Definition as DefinitionModel,
  DefinitionMut,
  PartOfSpeech,
  DefinitionDescription,
  DefinitionStem as DefinitionStemModel,
  DefinitionInflectionTable as DefinitionInflectionTableModel,
  DerivedDefinition as DerivedDefinitionModel,
  Tag,
  Lemma,
  Language,
  CustomInflectedForm as CustomInflectedFormModel,
  InflectionTable,
  InflectionTableLayout,
  InflectedForm,
  DefinitionRow,
  DefinitionStemRow,
  DefinitionInflectionTableRow,
  CustomInflectedFormRow,
  DerivedDefinitionRow,
} from '../../model';

import {
  Definition as DefinitionType,
  DefinitionId,
  DefinitionStem as DefinitionStemType,
  DefinitionInflectionTable as DefinitionInflectionTableType,
  DefinitionInflectionTableId,
  CustomInflectedForm as CustomInflectedFormType,
  DerivedDefinition as DerivedDefinitionType,
  NewDefinitionInput,
  EditDefinitionInput,
  Query as QueryType,
} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators, IdArg, PageArg} from './types';

const Definition: ResolversFor<DefinitionType, DefinitionRow> = {
  partOfSpeech: (p, _args, {db}) => PartOfSpeech.byId(db, p.part_of_speech_id),

  async description(p, _args, {db}) {
    const description = await DefinitionDescription.rawByDefinition(db, p.id);
    return JSON.parse(description) as unknown;
  },

  descriptionRaw: (p, _args, {db}) =>
    DefinitionDescription.rawByDefinition(db, p.id),

  stems: (p, _args, {db}) => DefinitionStemModel.allByDefinition(db, p.id),

  inflectionTables: (p, _args, {db}) =>
    DefinitionInflectionTableModel.allByDefinition(db, p.id),

  tags: (p, _args, {db}) => Tag.allByDefinition(db, p.id),

  derivedDefinitions: (p, {page}: PageArg, {db}, info) =>
    DerivedDefinitionModel.allByDerivedFrom(db, p.id, page, info),

  lemma: (p, _args, {db}) => Lemma.byId(db, p.lemma_id),

  language: (p, _args, {db}) => Language.byId(db, p.language_id),
};

const DefinitionStem: ResolversFor<DefinitionStemType, DefinitionStemRow> = {
  definition: (p, _args, {db}) =>
    DefinitionModel.byId(db, p.definition_id),
};

const DefinitionInflectionTable: ResolversFor<
  DefinitionInflectionTableType,
  DefinitionInflectionTableRow
> = {
  caption: p => p.caption && JSON.parse(p.caption) as unknown,

  captionRaw: p => p.caption,

  customForms: (p, _args, {db}) =>
    CustomInflectedFormModel.allByTable(db, p.id),

  inflectionTable: (p, _args, {db}) =>
    InflectionTable.byId(db, p.inflection_table_id),

  inflectionTableLayout: (p, _args, {db}) =>
    InflectionTableLayout.byId(db, p.inflection_table_version_id),

  definition: (p, _args, {db}) => DefinitionModel.byId(db, p.definition_id),
};

const CustomInflectedForm: ResolversFor<
  CustomInflectedFormType,
  CustomInflectedFormRow
> = {
  table: (p, _args, {db}) =>
    DefinitionInflectionTableModel.byId(db, p.definition_inflection_table_id),

  inflectedForm: (p, _args, {db}) =>
    InflectedForm.byId(db, p.inflected_form_id),

  value: p => p.inflected_form,
};

const DerivedDefinition: ResolversFor<
  DerivedDefinitionType,
  DerivedDefinitionRow
> = {
  derivedFrom: (p, _args, {db}) =>
    DefinitionModel.byId(db, p.original_definition_id),

  inflectedForm: (p, _args, {db}) =>
    InflectedForm.byId(db, p.inflected_form_id),

  lemma: (p, _args, {db}) => Lemma.byId(db, p.lemma_id),

  language: (p, _args, {db}) => Language.byId(db, p.language_id),
};

const Query: ResolversFor<QueryType, unknown> = {
  definition: (_root, {id}: IdArg<DefinitionId>, {db}) =>
    DefinitionModel.byId(db, id),

  definitionInflectionTable: (
    _root,
    {id}: IdArg<DefinitionInflectionTableId>,
    {db}
  ) =>
    DefinitionInflectionTableModel.byId(db, id),
};

type AddDefinitionArgs = {
  data: NewDefinitionInput;
};

type EditDefinitionArgs = {
  id: DefinitionId;
  data: EditDefinitionInput;
};

const Mutation: Mutators = {
  addDefinition: mutator(
    (_root, {data}: AddDefinitionArgs, {db}) =>
      DefinitionMut.insert(db, data)
  ),

  editDefinition: mutator(
    (_root, {id, data}: EditDefinitionArgs, {db}) =>
      DefinitionMut.update(db, id, data)
  ),

  deleteDefinition: mutator(
    (_root, {id}: IdArg<DefinitionId>, {db}) =>
      DefinitionMut.delete(db, id)
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
