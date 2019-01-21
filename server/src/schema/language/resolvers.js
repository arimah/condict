const {UserInputError} = require('apollo-server');

const {withAuthentication} = require('../helpers');

module.exports = {
  Language: {
    urlName: p => p.url_name,

    partsOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
      PartOfSpeech.allByLanguage(p.id),

    lemmaCount: p => p.lemma_count,

    lemmas: (p, {page, filter}, {model: {Lemma}}) =>
      Lemma.allByLanguage(p.id, page, filter, p.lemma_count),
  },

  Query: {
    languages: (_root, _args, {model: {Language}}) => Language.all(),

    language: (_root, args, {model: {Language}}) => {
      if (args.id != null) {
        return Language.byId(args.id);
      }
      if (args.urlName != null) {
        return Language.byUrlName(args.urlName);
      }
      throw new UserInputError(`You must specify one of 'id' or 'urlName'`, {
        invalidArgs: ['id', 'urlName']
      });
    },
  },

  Mutation: {
    addLanguage: withAuthentication(
      (_root, {data}, {mut: {LanguageMut}}) =>
        LanguageMut.insert(data)
    ),

    editLanguage: withAuthentication(
      (_root, {id, data}, {mut: {LanguageMut}}) =>
        LanguageMut.update(id, data)
    ),
  },
};
