import {LemmaRow} from '../../model/lemma/types';

import {Resolvers, IdArg} from '../types';

const Lemma: Resolvers<LemmaRow> = {
  // term_display and term_unique have the same contents, but the former just
  // feels more fitting for display.
  term: p => p.term_display,

  definitions: (p, _args, {model: {Definition}}) =>
    Definition.allByLemma(p.id),

  derivedDefinitions: (p, _args, {model: {DerivedDefinition}}) =>
    DerivedDefinition.allByLemma(p.id),

  tags: (p, _args, {model: {Tag}}) => Tag.allByLemma(p.id),

  language: (p, _args, {model: {Language}}) =>
    Language.byId(p.language_id),
};

const Query: Resolvers<unknown> = {
  lemma: (_root, {id}: IdArg, {model: {Lemma}}) =>
    Lemma.byId(+id),
};

export default {
  Lemma,
  Query,
};
