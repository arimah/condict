import {
  Definition as DefinitionModel,
  DefinitionMut,
  PartOfSpeech,
  DefinitionStem as DefinitionStemModel,
  DefinitionInflectionTable as DefinitionInflectionTableModel,
  DefinitionFieldValue as DefinitionFieldValueModel,
  DerivedDefinition as DerivedDefinitionModel,
  Description,
  Tag,
  Lemma,
  Language,
  CustomInflectedForm as CustomInflectedFormModel,
  InflectionTable,
  InflectionTableLayout,
  InflectedForm,
  Field,
  FieldValue,
  DefinitionRow,
  DefinitionStemRow,
  DefinitionInflectionTableRow,
  CustomInflectedFormRow,
  DefinitionFieldValueRow,
  DefinitionFieldTrueValueRow,
  DefinitionFieldListValueRow,
  DefinitionFieldPlainTextValueRow,
  DerivedDefinitionRow,
  MutContext,
} from '../../model';

import {
  Definition,
  DefinitionStem,
  DefinitionInflectionTable,
  CustomInflectedForm,
  DefinitionFieldValue,
  DefinitionFieldTrueValue,
  DefinitionFieldListValue,
  DefinitionFieldPlainTextValue,
  DerivedDefinition,
  Query,
} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators} from './types';

const Definition: ResolversFor<Definition, DefinitionRow> = {
  partOfSpeech: (p, _args, {db}) => PartOfSpeech.byId(db, p.part_of_speech_id),

  description: (p, _args, {db}) => Description.parsedById(db, p.description_id),

  stems: (p, _args, {db}) => DefinitionStemModel.allByDefinition(db, p.id),

  inflectionTables: (p, _args, {db}) =>
    DefinitionInflectionTableModel.allByDefinition(db, p.id),

  tags: (p, _args, {db}) => Tag.allByDefinition(db, p.id),

  fields: (p, _args, {db}) =>
    DefinitionFieldValueModel.allByDefinition(db, p.id),

  derivedDefinitions: (p, {page}, {db}, info) =>
    DerivedDefinitionModel.allByDerivedFrom(db, p.id, page, info),

  lemma: (p, _args, {db}) => Lemma.byId(db, p.lemma_id),

  language: (p, _args, {db}) => Language.byId(db, p.language_id),

  timeCreated: p => p.time_created,

  timeUpdated: p => p.time_updated,
};

const DefinitionStem: ResolversFor<DefinitionStem, DefinitionStemRow> = {
  definition: (p, _args, {db}) =>
    DefinitionModel.byId(db, p.definition_id),
};

const DefinitionInflectionTable: ResolversFor<
  DefinitionInflectionTable,
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
  CustomInflectedForm,
  CustomInflectedFormRow
> = {
  table: (p, _args, {db}) =>
    DefinitionInflectionTableModel.byId(db, p.definition_inflection_table_id),

  inflectedForm: (p, _args, {db}) =>
    InflectedForm.byId(db, p.inflected_form_id),

  value: p => p.inflected_form,
};

const DefinitionFieldValue: ResolversFor<
  DefinitionFieldValue,
  DefinitionFieldValueRow
> = {
  __resolveType: p => {
    switch (p.kind) {
      case 'bool': return 'DefinitionFieldTrueValue';
      case 'list': return 'DefinitionFieldListValue';
      case 'plain_text': return 'DefinitionFieldPlainTextValue';
    }
  },
};

const DefinitionFieldTrueValue: ResolversFor<
  DefinitionFieldTrueValue,
  DefinitionFieldTrueValueRow
> = {
  field: (p, _args, {db}) => Field.byId(db, p.field_id),
};

const DefinitionFieldListValue: ResolversFor<
  DefinitionFieldListValue,
  DefinitionFieldListValueRow
> = {
  field: (p, _args, {db}) => Field.byId(db, p.field_id),

  values: (p, _args, {db}) => p.value_ids.map(id => FieldValue.byId(db, id)),
};

const DefinitionFieldPlainTextValue: ResolversFor<
  DefinitionFieldPlainTextValue,
  DefinitionFieldPlainTextValueRow
> = {
  field: (p, _args, {db}) => Field.byId(db, p.field_id),
};

const DerivedDefinition: ResolversFor<
  DerivedDefinition,
  DerivedDefinitionRow
> = {
  derivedFrom: (p, _args, {db}) =>
    DefinitionModel.byId(db, p.original_definition_id),

  inflectedForm: (p, _args, {db}) =>
    InflectedForm.byId(db, p.inflected_form_id),

  lemma: (p, _args, {db}) => Lemma.byId(db, p.lemma_id),

  language: (p, _args, {db}) => Language.byId(db, p.language_id),
};

const Query: ResolversFor<Query, null> = {
  definition: (_root, {id}, {db}) =>
    DefinitionModel.byId(db, id),

  definitionInflectionTable: (_root, {id}, {db}) =>
    DefinitionInflectionTableModel.byId(db, id),
};

const Mutation: Mutators = {
  addDefinition: mutator((_root, {data}, context) =>
    DefinitionMut.insert(MutContext.from(context), data)
  ),

  editDefinition: mutator((_root, {id, data}, context) =>
    DefinitionMut.update(MutContext.from(context), id, data)
  ),

  deleteDefinition: mutator((_root, {id}, context) =>
    DefinitionMut.delete(MutContext.from(context), id)
  ),
};

export default {
  Definition,
  DefinitionStem,
  DefinitionInflectionTable,
  CustomInflectedForm,
  DefinitionFieldValue,
  DefinitionFieldTrueValue,
  DefinitionFieldListValue,
  DefinitionFieldPlainTextValue,
  DerivedDefinition,
  Query,
  Mutation,
};
