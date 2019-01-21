const {withAuthentication} = require('../helpers');

module.exports = {
  PartOfSpeech: {
    inflectionTables: (p, _args, {model: {InflectionTable}}) =>
      InflectionTable.allByPartOfSpeech(p.id),

    language: (p, _args, {model: {Language}}) =>
      Language.byId(p.language_id),
  },

  Query: {
    partOfSpeech: (_root, args, {model: {PartOfSpeech}}) =>
      PartOfSpeech.byId(args.id),
  },

  Mutation: {
    addPartOfSpeech: withAuthentication(
      (_root, {data}, {mut: {PartOfSpeechMut}}) =>
        PartOfSpeechMut.insert(data)
    ),

    editPartOfSpeech: withAuthentication(
      (_root, {id, data}, {mut: {PartOfSpeechMut}}) =>
        PartOfSpeechMut.update(id, data)
    ),

    deletePartOfSpeech: withAuthentication(
      (_root, {id}, {mut: {PartOfSpeechMut}}) =>
        PartOfSpeechMut.delete(id)
    ),
  },
};
