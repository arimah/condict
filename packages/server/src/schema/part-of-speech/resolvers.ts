import {toNumberId} from '../../model/id-of';
import {
  PartOfSpeechInputId,
  PartOfSpeechRow,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
} from '../../model/part-of-speech/types';

import {Resolvers, Mutators, IdArg, PageArg} from '../types';
import {mutator} from '../helpers';

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
  partOfSpeech: (_root, args: IdArg<PartOfSpeechInputId>, {model: {PartOfSpeech}}) =>
    PartOfSpeech.byId(toNumberId(args.id)),
};

type AddPartOfSpeechArgs = {
  data: NewPartOfSpeechInput;
};

type EditPartOfSpeechArgs = {
  id: PartOfSpeechInputId;
  data: EditPartOfSpeechInput;
};

const Mutation: Mutators<unknown> = {
  addPartOfSpeech: mutator(
    (_root, {data}: AddPartOfSpeechArgs, {mut: {PartOfSpeechMut}}) =>
      PartOfSpeechMut.insert(data)
  ),

  editPartOfSpeech: mutator(
    (_root, {id, data}: EditPartOfSpeechArgs, {mut: {PartOfSpeechMut}}) =>
      PartOfSpeechMut.update(toNumberId(id), data)
  ),

  deletePartOfSpeech: mutator(
    (_root, {id}: IdArg<PartOfSpeechInputId>, {mut: {PartOfSpeechMut}}) =>
      PartOfSpeechMut.delete(toNumberId(id))
  ),
};

export default {
  PartOfSpeech,
  Query,
  Mutation,
};
