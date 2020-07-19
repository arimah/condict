import {
  PartOfSpeech as PartOfSpeechModel,
  PartOfSpeechMut,
  InflectionTable,
  Language,
  Definition,
  PartOfSpeechRow,
} from '../../model';

import {
  PartOfSpeech as PartOfSpeechType,
  PartOfSpeechId,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
  Query as QueryType,
} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators, IdArg, PageArg} from './types';

const PartOfSpeech: ResolversFor<PartOfSpeechType, PartOfSpeechRow> = {
  inflectionTables: (p, _args, {db}) =>
    InflectionTable.allByPartOfSpeech(db, p.id),

  language: (p, _args, {db}) => Language.byId(db, p.language_id),

  isInUse: (p, _args, {db}) => Definition.anyUsesPartOfSpeech(db, p.id),

  usedByDefinitions: (p, {page}: PageArg, {db}, info) =>
    Definition.allByPartOfSpeech(db, p.id, page, info),
};

const Query: ResolversFor<QueryType, unknown> = {
  partOfSpeech: (_root, args: IdArg<PartOfSpeechId>, {db}) =>
    PartOfSpeechModel.byId(db, args.id),
};

type AddPartOfSpeechArgs = {
  data: NewPartOfSpeechInput;
};

type EditPartOfSpeechArgs = {
  id: PartOfSpeechId;
  data: EditPartOfSpeechInput;
};

const Mutation: Mutators = {
  addPartOfSpeech: mutator(
    (_root, {data}: AddPartOfSpeechArgs, {db}) =>
      PartOfSpeechMut.insert(db, data)
  ),

  editPartOfSpeech: mutator(
    (_root, {id, data}: EditPartOfSpeechArgs, {db}) =>
      PartOfSpeechMut.update(db, id, data)
  ),

  deletePartOfSpeech: mutator(
    (_root, {id}: IdArg<PartOfSpeechId>, {db}) =>
      PartOfSpeechMut.delete(db, id)
  ),
};

export default {
  PartOfSpeech,
  Query,
  Mutation,
};
