import {UserInputError} from 'apollo-server';

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
  urlName: p => p.url_name,

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
  id?: LanguageId | null;
  urlName?: string | null;
};

const Query: ResolversFor<QueryType, unknown> = {
  languages: (_root, _args, {model: {Language}}) => Language.all(),

  language: (_root, args: LanguageArgs, {model: {Language}}) => {
    if (args.id != null) {
      return Language.byId(args.id);
    }
    if (args.urlName != null) {
      return Language.byUrlName(args.urlName);
    }
    throw new UserInputError(`You must specify one of 'id' or 'urlName'`, {
      invalidArgs: ['id', 'urlName'],
    });
  },
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
