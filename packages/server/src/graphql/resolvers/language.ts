import {LanguageRow} from '../../model/language/types';

import {
  Language as LanguageType,
  LanguageId,
  LemmaFilter,
  NewLanguageInput,
  EditLanguageInput,
  Query as QueryType,
} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators, PageArg} from './types';

type LemmasArgs = PageArg & {
  filter?: LemmaFilter | null;
};

const Language: ResolversFor<LanguageType, LanguageRow> = {
  partsOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
    PartOfSpeech.allByLanguage(p.id),

  lemmaCount: p => p.lemma_count,

  lemmas: (p, {page, filter}: LemmasArgs, {model: {Lemma}}, info) =>
    Lemma.allByLanguage(
      p.id,
      page,
      filter || LemmaFilter.ALL_LEMMAS,
      info
    ),

  tags: (p, {page}: PageArg, {model: {Tag}}, info) =>
    Tag.allByLanguage(p.id, page, info),
};

type LanguageArgs = {
  id: LanguageId;
};

const Query: ResolversFor<QueryType, unknown> = {
  languages: (_root, _args, {model: {Language}}) => Language.all(),

  language: (_root, {id}: LanguageArgs, {model: {Language}}) =>
    Language.byId(id),
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
    (_root, {data}: AddLanguageArgs, {mut: {LanguageMut}}) =>
      LanguageMut.insert(data)
  ),

  editLanguage: mutator(
    (_root, {id, data}: EditLanguageArgs, {mut: {LanguageMut}}) =>
      LanguageMut.update(id, data)
  ),
};

export default {
  Language,
  Query,
  Mutation,
};
