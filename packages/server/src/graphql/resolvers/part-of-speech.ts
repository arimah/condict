import {PartOfSpeechRow} from '../../model/part-of-speech/types';

import {
  PartOfSpeechId,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
} from '../types';
import {mutator} from '../helpers';

import {Resolvers, Mutators, IdArg, PageArg} from './types';

const PartOfSpeech: Resolvers<PartOfSpeechRow> = {
  inflectionTables: (p, _args, {model: {InflectionTable}}) =>
    InflectionTable.allByPartOfSpeech(p.id),

  language: (p, _args, {model: {Language}}) =>
    Language.byId(p.language_id),

  isInUse: (p, _args, {model: {Definition}}) =>
    Definition.anyUsesPartOfSpeech(p.id),

  usedByDefinitions: (p, {page}: PageArg, {model: {Definition}}) =>
    Definition.allByPartOfSpeech(p.id, page),
};

const Query: Resolvers<unknown> = {
  partOfSpeech: (_root, args: IdArg<PartOfSpeechId>, {model: {PartOfSpeech}}) =>
    PartOfSpeech.byId(args.id),
};

type AddPartOfSpeechArgs = {
  data: NewPartOfSpeechInput;
};

type EditPartOfSpeechArgs = {
  id: PartOfSpeechId;
  data: EditPartOfSpeechInput;
};

const Mutation: Mutators<unknown> = {
  addPartOfSpeech: mutator(
    (_root, {data}: AddPartOfSpeechArgs, {mut: {PartOfSpeechMut}}) =>
      PartOfSpeechMut.insert(data)
  ),

  editPartOfSpeech: mutator(
    (_root, {id, data}: EditPartOfSpeechArgs, {mut: {PartOfSpeechMut}}) =>
      PartOfSpeechMut.update(id, data)
  ),

  deletePartOfSpeech: mutator(
    (_root, {id}: IdArg<PartOfSpeechId>, {mut: {PartOfSpeechMut}}) =>
      PartOfSpeechMut.delete(id)
  ),
};

export default {
  PartOfSpeech,
  Query,
  Mutation,
};
