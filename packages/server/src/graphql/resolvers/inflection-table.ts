import {
  InflectionTableRow,
  InflectionTableLayoutRow,
  InflectedFormRow,
  InflectionTableCellJson,
} from '../../model/inflection-table/types';

import {
  InflectionTable as InflectionTableType,
  InflectionTableId,
  InflectionTableLayout as InflectionTableLayoutType,
  InflectionTableLayoutId,
  InflectionTableCell as InflectionTableCellType,
  InflectionTableHeaderCell as InflectionTableHeaderCellType,
  InflectionTableDataCell as InflectionTableDataCellType,
  InflectedForm as InflectedFormType,
  InflectedFormId,
  NewInflectionTableInput,
  EditInflectionTableInput,
  Query as QueryType,
} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators, IdArg, PageArg} from './types';

const InflectionTable: ResolversFor<InflectionTableType, InflectionTableRow> = {
  layout: (p, _args, {model: {InflectionTableLayout}}) =>
    InflectionTableLayout.currentByTable(p.id),

  oldLayouts: (p, {page}: PageArg, {model: {InflectionTableLayout}}, info) =>
    InflectionTableLayout.allOldByTable(p.id, page, info),

  partOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
    PartOfSpeech.byId(p.part_of_speech_id),

  isInUse: (p, _args, {model: {Definition}}) =>
    Definition.anyUsesInflectionTable(p.id),

  usedByDefinitions: (p, {page}: PageArg, {model: {Definition}}, info) =>
    Definition.allByInflectionTable(p.id, page, info),
};

const InflectionTableLayout: ResolversFor<
  InflectionTableLayoutType,
  InflectionTableLayoutRow
> = {
  isCurrent: p => p.is_current === 1,

  rows: p => JSON.parse(p.layout),

  inflectedForms: (p, _args, {model: {InflectedForm}}) =>
    InflectedForm.allByTableLayout(p.id),

  stems: p => JSON.parse(p.stems),

  inflectionTable: (p, _args, {model: {InflectionTable}}) =>
    InflectionTable.byId(p.inflection_table_id),

  isInUse: (p, _args, {model: {Definition}}) =>
    Definition.anyUsesInflectionTableLayout(p.id),

  usedByDefinitions: (p, {page}: PageArg, {model: {Definition}}, info) =>
    Definition.allByInflectionTableLayout(p.id, page, info),
};

const InflectionTableCell: ResolversFor<
  InflectionTableCellType,
  InflectionTableCellJson
> = {
  __resolveType(p) {
    if (p.inflectedFormId) {
      return 'InflectionTableDataCell';
    }
    return 'InflectionTableHeaderCell';
  },
};

// We don't store columnSpan and rowSpan when their value is 1, so have to
// add fallback resolvers for that.
const InflectionTableHeaderCell: ResolversFor<
  InflectionTableHeaderCellType,
  InflectionTableCellJson
> = {
  columnSpan: p => p.columnSpan || 1,

  rowSpan: p => p.rowSpan || 1,
};

const InflectionTableDataCell: ResolversFor<
  InflectionTableDataCellType,
  InflectionTableCellJson
> = {
  columnSpan: p => p.columnSpan || 1,

  rowSpan: p => p.rowSpan || 1,

  inflectedForm: (p, _args, {model: {InflectedForm}}) =>
    p.inflectedFormId
      ? InflectedForm.byId(p.inflectedFormId)
      : null,
};

const InflectedForm: ResolversFor<InflectedFormType, InflectedFormRow> = {
  deriveLemma: p => p.derive_lemma === 1,

  inflectionPattern: p => p.inflection_pattern,

  displayName: p => p.display_name,

  hasCustomDisplayName: p => p.custom_display_name === 1,

  inflectionTableLayout: (p, _args, {model: {InflectionTableLayout}}) =>
    InflectionTableLayout.byId(p.inflection_table_version_id),
};

const Query: ResolversFor<QueryType, unknown> = {
  inflectionTable: (
    _root,
    {id}: IdArg<InflectionTableId>,
    {model: {InflectionTable}}
  ) =>
    InflectionTable.byId(id),

  inflectionTableLayout: (
    _root,
    {id}: IdArg<InflectionTableLayoutId>,
    {model: {InflectionTableLayout}}
  ) =>
    InflectionTableLayout.byId(id),

  inflectedForm: (
    _root,
    {id}: IdArg<InflectedFormId>,
    {model: {InflectedForm}}
  ) =>
    InflectedForm.byId(id),
};

type AddInflectionTableArgs = {
  data: NewInflectionTableInput;
};

type EditInflectionTableArgs = {
  id: InflectionTableId;
  data: EditInflectionTableInput;
};

const Mutation: Mutators = {
  addInflectionTable: mutator(
    (_root, {data}: AddInflectionTableArgs, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.insert(data)
  ),

  editInflectionTable: mutator(
    (_root, {id, data}: EditInflectionTableArgs, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.update(id, data)
  ),

  deleteInflectionTable: mutator(
    (_root, {id}: IdArg<InflectionTableId>, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.delete(id)
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
