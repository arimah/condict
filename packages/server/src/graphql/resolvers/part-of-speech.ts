import {
  PartOfSpeech as PartOfSpeechModel,
  PartOfSpeechMut,
  InflectionTable,
  Language,
  Definition,
  PartOfSpeechRow,
} from '../../model';

import {PartOfSpeech as PartOfSpeechType, Query as QueryType} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators} from './types';

const PartOfSpeech: ResolversFor<PartOfSpeechType, PartOfSpeechRow> = {
  inflectionTables: (p, _args, {db}) =>
    InflectionTable.allByPartOfSpeech(db, p.id),

  language: (p, _args, {db}) => Language.byId(db, p.language_id),

  isInUse: (p, _args, {db}) => Definition.anyUsesPartOfSpeech(db, p.id),

  usedByDefinitions: (p, {page}, {db}, info) =>
    Definition.allByPartOfSpeech(db, p.id, page, info),
};

const Query: ResolversFor<QueryType, null> = {
  partOfSpeech: (_root, args, {db}) => PartOfSpeechModel.byId(db, args.id),
};

const Mutation: Mutators = {
  addPartOfSpeech: mutator(
    (_root, {data}, {db}) =>
      PartOfSpeechMut.insert(db, data)
  ),

  editPartOfSpeech: mutator(
    (_root, {id, data}, {db}) =>
      PartOfSpeechMut.update(db, id, data)
  ),

  deletePartOfSpeech: mutator(
    (_root, {id}, {db}) =>
      PartOfSpeechMut.delete(db, id)
  ),
};

export default {
  PartOfSpeech,
  Query,
  Mutation,
};
