import {
  InflectionTableRow,
  InflectedFormRow,
  NewInflectionTableInput,
  EditInflectionTableInput,
  InflectionTableCellJson,
} from '../../model/inflection-table/types';

import {Resolvers, Mutators, IdArg, PageArg} from '../types';
import {mutator} from '../helpers';

const InflectionTable: Resolvers<InflectionTableRow> = {
  async layout(p, _args, {model: {InflectionTableLayout}}) {
    const row = await InflectionTableLayout.byTable(p.id);
    return row ? JSON.parse(row.layout) : [];
  },

  async layoutRaw(p, _args, {model: {InflectionTableLayout}}) {
    const row = await InflectionTableLayout.byTable(p.id);
    return row ? row.layout : '[]';
  },

  async stems(p, _args, {model: {InflectionTableLayout}}) {
    const row = await InflectionTableLayout.byTable(p.id);
    return row ? JSON.parse(row.stems) : [];
  },

  inflectedForms: (p, _args, {model: {InflectedForm}}) =>
    InflectedForm.allByTable(p.id),

  partOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
    PartOfSpeech.byId(p.part_of_speech_id),

  isInUse: (p, _args, {model: {Definition}}) =>
    Definition.anyUsesInflectionTable(p.id),

  usedByDefinitions: (p, {page}: PageArg, {model: {Definition}}) =>
    Definition.allByInflectionTable(p.id, page),
};

const InflectionTableCell: Resolvers<InflectionTableCellJson> = {
  __resolveType(p) {
    if (p.inflectedFormId) {
      return 'InflectionTableDataCell';
    }
    return 'InflectionTableHeaderCell';
  }
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
    // We can never get here unless inflectedFormId is non-null
    InflectedForm.byId(p.inflectedFormId as number),
};

const InflectedForm: Resolvers<InflectedFormRow> = {
  deriveLemma: p => p.derive_lemma === 1,

  inflectionPattern: p => p.inflection_pattern,

  displayName: p => p.display_name,

  hasCustomDisplayName: p => p.custom_display_name === 1,

  inflectionTable: (p, _args, {model: {InflectionTable}}) =>
    InflectionTable.byId(p.inflection_table_id),
};

const Query: Resolvers<unknown> = {
  inflectionTable: (_root, {id}: IdArg, {model: {InflectionTable}}) =>
    InflectionTable.byId(+id),

  inflectedForm: (_root, {id}: IdArg, {model: {InflectedForm}}) =>
    InflectedForm.byId(+id),
};

interface AddInflectionTableArgs {
  data: NewInflectionTableInput;
}

interface EditInflectionTableArgs {
  id: string;
  data: EditInflectionTableInput;
}

const Mutation: Mutators<unknown> = {
  addInflectionTable: mutator(
    (_root, {data}: AddInflectionTableArgs, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.insert(data)
  ),

  editInflectionTable: mutator(
    (_root, {id, data}: EditInflectionTableArgs, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.update(
        +id,
        data
      )
  ),

  deleteInflectionTable: mutator(
    (_root, {id}: IdArg, {mut: {InflectionTableMut}}) =>
      InflectionTableMut.delete(+id),
  ),
};

export default {
  InflectionTable,
  // The rows stored in inflection_tables.layout exactly corresponds to the
  // format of InflectionTableRow, so no need to add a resolver for that!
  InflectionTableCell,
  InflectionTableHeaderCell,
  InflectionTableDataCell,
  InflectedForm,
  Query,
  Mutation,
};
