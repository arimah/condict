import {UserInputError} from 'apollo-server';

import {
  Language as LanguageModel,
  LanguageMut,
  Description,
  PartOfSpeech,
  Lemma,
  Tag,
  SearchIndex,
  LanguageRow,
} from '../../model';

import {Language as LanguageType, Query as QueryType} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators} from './types';

const Language: ResolversFor<LanguageType, LanguageRow> = {
  async description(p, _args, {db}) {
    const description = await Description.rawById(db, p.description_id);
    return JSON.parse(description) as unknown;
  },

  descriptionRaw: (p, _args, {db}) => Description.rawById(db, p.description_id),

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

  search: (p, {params, page}, {db}, info) => {
    const {scopes} = params;
    if (scopes) {
      if (
        scopes.includes('SEARCH_LANGUAGES') ||
        scopes.includes('SEARCH_TAGS')
      ) {
        throw new UserInputError(
          `The search scopes SEARCH_LANGUAGES and SEARCH_TAGS are not valid when searching in a language`,
          {invalidArgs: ['params']}
        );
      }
    }
    return SearchIndex.search(
      db,
      params.query,
      scopes ?? null,
      {
        inLanguages: [p.id],
        inPartsOfSpeech: params.inPartsOfSpeech ?? null,
        withTags: params.withTags ?? null,
        tagMatching: params.tagMatching ?? 'MATCH_ANY',
      },
      page,
      info
    );
  },

  timeCreated: p => p.time_created,

  timeUpdated: p => p.time_updated,
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
