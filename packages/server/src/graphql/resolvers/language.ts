import {
  Language as LanguageModel,
  LanguageMut,
  PartOfSpeech,
  Lemma,
  Tag,
  LanguageRow,
} from '../../model';

import {
  Language as LanguageType,
  LanguageId,
  LemmaFilter,
  NewLanguageInput,
  EditLanguageInput,
  Query as QueryType,
} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators, IdArg, PageArg} from './types';

type LemmasArgs = PageArg & {
  filter?: LemmaFilter | null;
};

const Language: ResolversFor<LanguageType, LanguageRow> = {
  partsOfSpeech: (p, _args, {db}) => PartOfSpeech.allByLanguage(db, p.id),

  lemmaCount: p => p.lemma_count,

  lemmas: (p, {page, filter}: LemmasArgs, {db}, info) =>
    Lemma.allByLanguage(
      db,
      p.id,
      page,
      filter || 'ALL_LEMMAS',
      info
    ),

  tags: (p, {page}: PageArg, {db}, info) =>
    Tag.allByLanguage(db, p.id, page, info),
};

const Query: ResolversFor<QueryType, unknown> = {
  languages: (_root, _args, {db}) => LanguageModel.all(db),

  language: (_root, {id}: IdArg<LanguageId>, {db}) =>
    LanguageModel.byId(db, id),
};

type AddLanguageArgs = {
  data: NewLanguageInput;
};

type EditLanguageArgs = {
  id: LanguageId;
  data: EditLanguageInput;
};

const Mutation: Mutators = {
  addLanguage: mutator(
    (_root, {data}: AddLanguageArgs, {db}) =>
      LanguageMut.insert(db, data)
  ),

  editLanguage: mutator(
    (_root, {id, data}: EditLanguageArgs, {db}) =>
      LanguageMut.update(db, id, data)
  ),
};

export default {
  Language,
  Query,
  Mutation,
};
