const {withAuthentication} = require('../helpers');

module.exports = {
  InflectionTable: {
    async layout(p, _args, {model: {InflectionTableLayout}}) {
      const row = await InflectionTableLayout.byTable(p.id);
      return JSON.parse(row.layout);
    },

    async layoutRaw(p, _args, {model: {InflectionTableLayout}}) {
      const row = await InflectionTableLayout.byTable(p.id);
      return row.layout;
    },

    async stems(p, _args, {model: {InflectionTableLayout}}) {
      const row = await InflectionTableLayout.byTable(p.id);
      return JSON.parse(row.stems);
    },

    inflectedForms: (p, _args, {model: {InflectedForm}}) =>
      InflectedForm.allByTable(p.id),

    partOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
      PartOfSpeech.byId(p.part_of_speech_id),
  },

  // The rows stored in inflection_tables.layout exactly corresponds to the
  // format of InflectionTableRow, so no need to add a resolver for that!

  InflectionTableCell: {
    __resolveType(p) {
      if (p.inflectedFormId) {
        return 'InflectionTableDataCell';
      }
      return 'InflectionTableHeaderCell';
    }
  },

  // We don't store columnSpan and rowSpan when their value is 1, so have to
  // add fallback resolvers for that.

  InflectionTableHeaderCell: {
    columnSpan: p => p.columnSpan || 1,

    rowSpan: p => p.rowSpan || 1,
  },

  InflectionTableDataCell: {
    columnSpan: p => p.columnSpan || 1,

    rowSpan: p => p.rowSpan || 1,

    inflectedForm: (p, _args, {model: {InflectedForm}}) =>
      InflectedForm.byId(p.inflectedFormId),
  },

  InflectedForm: {
    deriveLemma: p => p.derive_lemma === 1,

    inflectionPattern: p => p.inflection_pattern,

    displayName: p => p.display_name,

    hasCustomDisplayName: p => p.custom_display_name === 1,

    inflectionTable: (p, _args, {model: {InflectionTable}}) =>
      InflectionTable.byId(p.inflection_table_id),
  },

  Query: {
    inflectionTable: (_root, {id}, {model: {InflectionTable}}) =>
      InflectionTable.byId(id),

    inflectedForm: (_root, {id}, {model: {InflectedForm}}) =>
      InflectedForm.byId(id),
  },

  Mutation: {
    addInflectionTable: withAuthentication(
      (_root, {data}, {mut: {InflectionTableMut}}) =>
        InflectionTableMut.insert(data)
    ),

    editInflectionTable: withAuthentication(
      (_root, {id, data}, {mut: {InflectionTableMut}}) =>
        InflectionTableMut.update(id, data)
    ),

    deleteInflectionTable: withAuthentication(
      (_root, {id}, {mut: {InflectionTableMut}}) =>
        InflectionTableMut.delete(id),
    ),
  },
};
