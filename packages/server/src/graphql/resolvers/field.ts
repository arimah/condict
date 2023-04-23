import {
  Field as FieldModel,
  FieldValue as FieldValueModel,
  PartOfSpeech,
  Language,
  FieldRow,
  FieldValueRow,
  RawFieldType,
  MutContext,
} from '../../model';

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

export default {
  Field,
  FieldValue,
  Query,
};
