import {toNumberId} from '../../model/id-of';
import {
  InflectionTableRow,
  InflectionTableLayoutRow,
  InflectedFormRow,
  InflectionTableInputId,
  NewInflectionTableInput,
  EditInflectionTableInput,
  InflectionTableLayoutInputId,
  InflectedFormInputId,
  InflectionTableCellJson,
} from '../../model/inflection-table/types';

import {Resolvers, Mutators, IdArg, PageArg} from '../types';
import {mutator} from '../helpers';

const InflectionTable: Resolvers<InflectionTableRow> = {
  layout: (p, _args, {model: {InflectionTableLayout}}) =>
    InflectionTableLayout.currentByTable(p.id),

  oldLayouts: (p, {page}: PageArg, {model: {InflectionTableLayout}}) =>
    InflectionTableLayout.allOldByTable(p.id, page),

  partOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
    PartOfSpeech.byId(p.part_of_speech_id),

  isInUse: (p, _args, {model: {Definition}}) =>
    Definition.anyUsesInflectionTable(p.id),

  usedByDefinitions: (p, {page}: PageArg, {model: {Definition}}) =>
    Definition.allByInflectionTable(p.id, page),
};

const InflectionTableLayout: Resolvers<InflectionTableLayoutRow> = {
  isCurrent: p => p.is_current === 1,

  rows: p => JSON.parse(p.layout),

  inflectedForms: (p, _args, {model: {InflectedForm}}) =>
    InflectedForm.allByTableLayout(p.id),

  stems: p => JSON.parse(p.stems),

  inflectionTable: (p, _args, {model: {InflectionTable}}) =>
    InflectionTable.byId(p.inflection_table_id),

  isInUse: (p, _args, {model: {Definition}}) =>
    Definition.anyUsesInflectionTableLayout(p.id),

  usedByDefinitions: (p, {page}: PageArg, {model: {Definition}}) =>
    Definition.allByInflectionTableLayout(p.id, page),
};

const InflectionTableCell: Resolvers<InflectionTableCellJson> = {
  __resolveType(p) {
    if (p.inflectedFormId) {
      return 'InflectionTableDataCell';
    }
    return 'InflectionTableHeaderCell';
  },
};

// We don't store columnSpan and rowSpan when their value is 1, so have to
// add fallback resolvers for that.
const InflectionTableHeaderCell: Resolvers<InflectionTableCellJson> = {
  columnSpan: p => p.columnSpan || 1,

  rowSpan: p => p.rowSpan || 1,
};

const InflectionTableDataCell: Resolvers<InflectionTableCellJson> = {
  columnSpan: p => p.columnSpan || 1,

  rowSpan: p => p.rowSpan || 1,

  inflectedForm: (p, _args, {model: {InflectedForm}}) =>
    p.inflectedFormId
      ? InflectedForm.byId(p.inflectedFormId)
      : null,
};

const InflectedForm: Resolvers<InflectedFormRow> = {
  deriveLemma: p => p.derive_lemma === 1,

  inflectionPattern: p => p.inflection_pattern,

  displayName: p => p.display_name,

  hasCustomDisplayName: p => p.custom_display_name === 1,

  inflectionTableLayout: (p, _args, {model: {InflectionTableLayout}}) =>
    InflectionTableLayout.byId(p.inflection_table_version_id),
};

const Query: Resolvers<unknown> = {
  inflectionTable: (
    _root,
    {id}: IdArg<InflectionTableInputId>,
    {model: {InflectionTable}}
  ) =>
    InflectionTable.byId(toNumberId(id)),

  inflectionTableLayout: (
    _root,
    {id}: IdArg<InflectionTableLayoutInputId>,
    {model: {InflectionTableLayout}}
  ) =>
    InflectionTableLayout.byId(toNumberId(id)),

  inflectedForm: (
    _root,
    {id}: IdArg<InflectedFormInputId>,
    {model: {InflectedForm}}
  ) =>
    InflectedForm.byId(toNumberId(id)),
};

type AddInflectionTableArgs = {
  data: NewInflectionTableInput;
};

type EditInflectionTableArgs = {
  id: InflectionTableInputId;
  data: EditInflectionTableInput;
};

const Mutation: Mutators<unknown> = {
  addInflectionTable: mutator(
    (_root, {data}: AddInflectionTableArgs, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.insert(data)
  ),

  editInflectionTable: mutator(
    (_root, {id, data}: EditInflectionTableArgs, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.update(
        toNumberId(id),
        data
      )
  ),

  deleteInflectionTable: mutator(
    (_root, {id}: IdArg<InflectionTableInputId>, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.delete(toNumberId(id))
  ),
};

export default {
  InflectionTable,
  InflectionTableLayout,
  // The rows stored in inflection_table_layouts.layout exactly corresponds to
  // the format of InflectionTableRow, so no need to add a resolver for that!
  InflectionTableCell,
  InflectionTableHeaderCell,
  InflectionTableDataCell,
  InflectedForm,
  Query,
  Mutation,
};
