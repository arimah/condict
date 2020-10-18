import {
  Lemma as LemmaModel,
  Definition,
  DerivedDefinition,
  Tag,
  Language,
  LemmaRow,
} from '../../model';

import {Lemma as LemmaType, Query as QueryType} from '../types';

import {ResolversFor} from './types';

const Lemma: ResolversFor<LemmaType, LemmaRow> = {
  // term_display and term_unique have the same contents, but the former just
  // feels more fitting for display.
  term: p => p.term_display,

  definitions: (p, _args, {db}) => Definition.allByLemma(db, p.id),

  derivedDefinitions: (p, _args, {db}) =>
    DerivedDefinition.allByLemma(db, p.id),

  tags: (p, _args, {db}) => Tag.allByLemma(db, p.id),

  language: (p, _args, {db}) => Language.byId(db, p.language_id),
};

const Query: ResolversFor<QueryType, null> = {
  lemma: (_root, {id}, {db}) => LemmaModel.byId(db, id),
};

export default {
  Lemma,
  Query,
};
