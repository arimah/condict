import {
  PartOfSpeech as PartOfSpeechModel,
  PartOfSpeechStats as PartOfSpeechStatsModel,
  PartOfSpeechMut,
  Language,
  Definition,
  PartOfSpeechRow,
  PartOfSpeechStatsRow,
  Description,
  MutContext,
} from '../../model';

import {
  PartOfSpeech as PartOfSpeechType,
  PartOfSpeechStats as PartOfSpeechStatsType,
  Query as QueryType,
} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators} from './types';

const PartOfSpeech: ResolversFor<PartOfSpeechType, PartOfSpeechRow> = {
  language: (p, _args, {db}) => Language.byId(db, p.language_id),

  description: (p, _args, {db}) => Description.parsedById(db, p.description_id),

  isInUse: (p, _args, {db}) => Definition.anyUsesPartOfSpeech(db, p.id),

  usedByDefinitions: (p, {page}, {db}, info) =>
    Definition.allByPartOfSpeech(db, p.id, page, info),

  timeCreated: p => p.time_created,

  timeUpdated: p => p.time_updated,

  statistics: (p, _args, {db}) => PartOfSpeechStatsModel.byId(db, p.id),
};

const PartOfSpeechStats: ResolversFor<
  PartOfSpeechStatsType,
  PartOfSpeechStatsRow
> = {
  definitionCount: p => p.definition_count,
};

const Query: ResolversFor<QueryType, null> = {
  partOfSpeech: (_root, args, {db}) => PartOfSpeechModel.byId(db, args.id),
};

const Mutation: Mutators = {
  addPartOfSpeech: mutator((_root, {data}, context) =>
    PartOfSpeechMut.insert(MutContext.from(context), data)
  ),

  editPartOfSpeech: mutator((_root, {id, data}, context) =>
    PartOfSpeechMut.update(MutContext.from(context), id, data)
  ),

  deletePartOfSpeech: mutator((_root, {id}, context) =>
    PartOfSpeechMut.delete(MutContext.from(context), id)
  ),
};

export default {
  PartOfSpeech,
  PartOfSpeechStats,
  Query,
  Mutation,
};
