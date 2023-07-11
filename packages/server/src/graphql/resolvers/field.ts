import {
  Field as FieldModel,
  FieldMut,
  FieldValue as FieldValueModel,
  FieldValueMut,
  PartOfSpeech,
  Language,
  FieldRow,
  FieldValueRow,
  RawFieldType,
  MutContext,
} from '../../model';

import {mutator} from '../helpers';
import {
  Field,
  FieldValue,
  Query,
} from '../types';

import {ResolversFor, Mutators} from './types';

const Field: ResolversFor<Field, FieldRow> = {
  nameAbbr: p => p.name_abbr,

  valueType: p => {
    switch (p.value_type) {
      case RawFieldType.BOOLEAN:
        return 'FIELD_BOOLEAN';
      case RawFieldType.LIST_ONE:
        return 'FIELD_LIST_ONE';
      case RawFieldType.LIST_MANY:
        return 'FIELD_LIST_MANY';
      case RawFieldType.PLAIN_TEXT:
        return 'FIELD_PLAIN_TEXT';
      default:
        return null;
    }
  },

  listValues: (p, _args, {db}) => {
    if (
      p.value_type == RawFieldType.LIST_ONE ||
      p.value_type === RawFieldType.LIST_MANY
    ) {
      return FieldValueModel.allByField(db, p.id);
    }
    return null;
  },

  partsOfSpeech: (p, _args, {db}) => {
    if (p.has_pos_filter == 0) {
      return null;
    }
    return PartOfSpeech.allByField(db, p.id);
  },

  language: (p, _args, {db}) => Language.byId(db, p.language_id),
};

const FieldValue: ResolversFor<FieldValue, FieldValueRow> = {
  valueAbbr: p => p.value_abbr,

  field: (p, _args, {db}) => FieldModel.byId(db, p.field_id),
};

const Query: ResolversFor<Query, null> = {
  field: (_root, {id}, {db}) => FieldModel.byId(db, id),

  fieldValue: (_root, {id}, {db}) => FieldValueModel.byId(db, id),
};

const Mutation: Mutators = {
  addField: mutator((_root, {data}, context) =>
    FieldMut.insert(MutContext.from(context), data)
  ),

  editField: mutator((_root, {id, data}, context) =>
    FieldMut.update(MutContext.from(context), id, data)
  ),

  deleteField: mutator((_root, {id}, context) =>
    FieldMut.delete(MutContext.from(context), id)
  ),

  addFieldValue: mutator((_root, {data}, context) =>
    FieldValueMut.insert(MutContext.from(context), data)
  ),

  editFieldValue: mutator((_root, {id, data}, context) =>
    FieldValueMut.update(MutContext.from(context), id, data)
  ),

  deleteFieldValue: mutator((_root, {id}, context) =>
    FieldValueMut.delete(MutContext.from(context), id)
  ),

  validateFieldValues: mutator((_root, {values}, {db}) =>
    FieldValueModel.validateSet(db, values)
  ),
};

export default {
  Field,
  FieldValue,
  Query,
  Mutation,
};
