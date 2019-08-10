import {UserInputError} from 'apollo-server';

import {toNumberId} from '../../model/id-of';
import {
  LanguageRow,
  LanguageInputId,
  NewLanguageInput,
  EditLanguageInput,
} from '../../model/language/types';
import {LemmaFilter} from '../../model/lemma/types';

import {Resolvers, Mutators, PageArg} from '../types';
import {mutator} from '../helpers';

type LemmasArgs = PageArg & {
  filter?: LemmaFilter | null;
};

const Language: Resolvers<LanguageRow> = {
  urlName: p => p.url_name,

  partsOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
    PartOfSpeech.allByLanguage(p.id),

  lemmaCount: p => p.lemma_count,

  lemmas: (p, {page, filter}: LemmasArgs, {model: {Lemma}}) =>
    Lemma.allByLanguage(p.id, page, filter || LemmaFilter.ALL_LEMMAS),

  tags: (p, {page}: PageArg, {model: {Tag}}) =>
    Tag.allByLanguage(p.id, page),
};

type LanguageArgs = {
  id?: LanguageInputId | null;
  urlName?: string | null;
};

const Query: Resolvers<unknown> = {
  languages: (_root, _args, {model: {Language}}) => Language.all(),

  language: (_root, args: LanguageArgs, {model: {Language}}) => {
    if (args.id != null) {
      return Language.byId(toNumberId(args.id));
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
  id: LanguageInputId;
  data: EditLanguageInput;
};

const Mutation: Mutators<unknown> = {
  addLanguage: mutator(
    (_root, {data}: AddLanguageArgs, {mut: {LanguageMut}}) =>
      LanguageMut.insert(data)
  ),

  editLanguage: mutator(
    (_root, {id, data}: EditLanguageArgs, {mut: {LanguageMut}}) =>
      LanguageMut.update(toNumberId(id), data)
  ),
};

export default {
  Language,
  Query,
  Mutation,
};
