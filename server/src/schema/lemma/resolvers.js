module.exports = {
  Lemma: {
    // term_display and term_unique have the same contents, but the former just
    // feels more fitting for display.
    term: p => p.term_display,

    definitions: (p, _args, {model: {Definition}}) =>
      Definition.allByLemma(p.id),

    derivedDefinitions: (p, _args, {model: {DerivedDefinition}}) =>
      DerivedDefinition.allByLemma(p.id),

    language: (p, _args, {model: {Language}}) =>
      Language.byId(p.language_id),
  },

  Query: {
    lemma: (_root, {id}, {model: {Lemma}}) =>
      Lemma.byId(id),
  },
};
