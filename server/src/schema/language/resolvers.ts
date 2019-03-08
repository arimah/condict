import {UserInputError} from 'apollo-server';

import {LanguageRow} from '../../model/language/model';
import {LemmaFilter} from '../../model/lemma/model';
import {
  NewLanguageInput,
  EditLanguageInput,
} from '../../model/language/mut';

import {Resolvers, Mutators, PageArg} from '../types';
import {mutator} from '../helpers';

interface LemmasArgs extends PageArg {
  filter?: LemmaFilter | null;
}

const Language: Resolvers<LanguageRow> = {
  urlName: p => p.url_name,

  partsOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
    PartOfSpeech.allByLanguage(p.id),

  lemmaCount: p => p.lemma_count,

  lemmas: (p, {page, filter}: LemmasArgs, {model: {Lemma}}) =>
    Lemma.allByLanguage(p.id, page, filter || LemmaFilter.ALL_LEMMAS),
};

interface LanguageArgs {
  id?: string | null;
  urlName?: string | null;
}

const Query: Resolvers<unknown> = {
  languages: (_root, _args, {model: {Language}}) => Language.all(),

  language: (_root, args: LanguageArgs, {model: {Language}}) => {
    if (args.id != null) {
      return Language.byId(+args.id);
    }
    if (args.urlName != null) {
      return Language.byUrlName(args.urlName);
    }
    throw new UserInputError(`You must specify one of 'id' or 'urlName'`, {
      invalidArgs: ['id', 'urlName']
    });
  },
};

interface AddLanguageArgs {
  data: NewLanguageInput;
}

interface EditLanguageArgs {
  id: string;
  data: EditLanguageInput;
}

const Mutation: Mutators<unknown> = {
  addLanguage: mutator(
    (_root, {data}: AddLanguageArgs, {mut: {LanguageMut}}) =>
      LanguageMut.insert(data)
  ),

  editLanguage: mutator(
    (_root, {id, data}: EditLanguageArgs, {mut: {LanguageMut}}) =>
      LanguageMut.update(+id, data)
  ),
};

export default {
  Language,
  Query,
  Mutation,
};
