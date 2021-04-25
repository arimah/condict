import {
  Language as LanguageModel,
  LanguageDescription,
  LanguageMut,
  PartOfSpeech,
  Lemma,
  Tag,
  LanguageRow,
} from '../../model';

import {Language as LanguageType, Query as QueryType} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators} from './types';

const Language: ResolversFor<LanguageType, LanguageRow> = {
  async description(p, _args, {db}) {
    const description = await LanguageDescription.rawByLanguage(db, p.id);
    return JSON.parse(description) as unknown;
  },

  descriptionRaw: (p, _args, {db}) =>
    LanguageDescription.rawByLanguage(db, p.id),

  partsOfSpeech: (p, _args, {db}) => PartOfSpeech.allByLanguage(db, p.id),

  lemmaCount: p => p.lemma_count,

  lemmas: (p, {page, filter}, {db}, info) =>
    Lemma.allByLanguage(
      db,
      p.id,
      page,
      filter || 'ALL_LEMMAS',
      info
    ),

  tags: (p, {page}, {db}, info) =>
    Tag.allByLanguage(db, p.id, page, info),
};

const Query: ResolversFor<QueryType, null> = {
  languages: (_root, _args, {db}) => LanguageModel.all(db),

  language: (_root, {id}, {db}) => LanguageModel.byId(db, id),
};

const Mutation: Mutators = {
  addLanguage: mutator(
    (_root, {data}, {db}) => LanguageMut.insert(db, data)
  ),

  editLanguage: mutator(
    (_root, {id, data}, {db}) => LanguageMut.update(db, id, data)
  ),
};

export default {
  Language,
  Query,
  Mutation,
};
