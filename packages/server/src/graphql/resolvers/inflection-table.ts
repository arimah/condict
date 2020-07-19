import {
  InflectionTable as InflectionTableModel,
  InflectionTableMut,
  InflectionTableLayout as InflectionTableLayoutModel,
  InflectedForm as InflectedFormModel,
  Definition,
  PartOfSpeech,
  InflectionTableRow,
  InflectionTableLayoutRow,
  InflectedFormRow,
  InflectionTableCellJson,
} from '../../model';

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
  layout: (p, _args, {db}) =>
    InflectionTableLayoutModel.currentByTable(db, p.id),

  oldLayouts: (p, {page}: PageArg, {db}, info) =>
    InflectionTableLayoutModel.allOldByTable(db, p.id, page, info),

  partOfSpeech: (p, _args, {db}) => PartOfSpeech.byId(db, p.part_of_speech_id),

  isInUse: (p, _args, {db}) => Definition.anyUsesInflectionTable(db, p.id),

  usedByDefinitions: (p, {page}: PageArg, {db}, info) =>
    Definition.allByInflectionTable(db, p.id, page, info),
};

const InflectionTableLayout: ResolversFor<
  InflectionTableLayoutType,
  InflectionTableLayoutRow
> = {
  isCurrent: p => p.is_current === 1,

  rows: p => JSON.parse(p.layout),

  inflectedForms: (p, _args, {db}) =>
    InflectedFormModel.allByTableLayout(db, p.id),

  stems: p => JSON.parse(p.stems),

  inflectionTable: (p, _args, {db}) =>
    InflectionTableModel.byId(db, p.inflection_table_id),

  isInUse: (p, _args, {db}) =>
    Definition.anyUsesInflectionTableLayout(db, p.id),

  usedByDefinitions: (p, {page}: PageArg, {db}, info) =>
    Definition.allByInflectionTableLayout(db, p.id, page, info),
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

  inflectedForm: (p, _args, {db}) =>
    p.inflectedFormId
      ? InflectedFormModel.byId(db, p.inflectedFormId)
      : null,
};

const InflectedForm: ResolversFor<InflectedFormType, InflectedFormRow> = {
  deriveLemma: p => p.derive_lemma === 1,

  inflectionPattern: p => p.inflection_pattern,

  displayName: p => p.display_name,

  hasCustomDisplayName: p => p.custom_display_name === 1,

  inflectionTableLayout: (p, _args, {db}) =>
    InflectionTableLayoutModel.byId(db, p.inflection_table_version_id),
};

const Query: ResolversFor<QueryType, unknown> = {
  inflectionTable: (_root, {id}: IdArg<InflectionTableId>, {db}) =>
    InflectionTableModel.byId(db, id),

  inflectionTableLayout: (_root, {id}: IdArg<InflectionTableLayoutId>, {db}) =>
    InflectionTableLayoutModel.byId(db, id),

  inflectedForm: (_root, {id}: IdArg<InflectedFormId>, {db}) =>
    InflectedFormModel.byId(db, id),
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
    (_root, {data}: AddInflectionTableArgs, {db}) =>
      InflectionTableMut.insert(db, data)
  ),

  editInflectionTable: mutator(
    (_root, {id, data}: EditInflectionTableArgs, {db}) =>
      InflectionTableMut.update(db, id, data)
  ),

  deleteInflectionTable: mutator(
    (_root, {id}: IdArg<InflectionTableId>, {db}) =>
      InflectionTableMut.delete(db, id)
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
