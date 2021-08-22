import {UserInputError} from 'apollo-server';

import {
  Language as LanguageModel,
  LanguageStats as LanguageStatsModel,
  LanguageMut,
  Description,
  Definition,
  PartOfSpeech,
  Lemma,
  Tag,
  SearchIndex,
  LanguageRow,
  LanguageStatsRow,
  MutContext,
} from '../../model';

import {
  Language as LanguageType,
  LanguageStats as LanguageStatsType,
  Query as QueryType,
} from '../types';
import {mutator} from '../helpers';

import {ResolversFor, Mutators} from './types';

const Language: ResolversFor<LanguageType, LanguageRow> = {
  async description(p, _args, {db}) {
    const description = await Description.rawById(db, p.description_id);
    return JSON.parse(description) as unknown;
  },

  descriptionRaw: (p, _args, {db}) => Description.rawById(db, p.description_id),

  partsOfSpeech: (p, _args, {db}) => PartOfSpeech.allByLanguage(db, p.id),

  partOfSpeechByName: (p, {name}, {db}) => PartOfSpeech.byName(db, p.id, name),

  lemmaCount: p => p.lemma_count,

  lemmas: (p, {page, filter}, {db}, info) =>
    Lemma.allByLanguage(db, p.id, page, filter, info),

  firstLemma: (p, _args, {db}) => Lemma.firstInLanguage(db, p.id),

  lastLemma: (p, _args, {db}) => Lemma.lastInLanguage(db, p.id),

  tags: (p, {page}, {db}, info) =>
    Tag.allByLanguage(db, p.id, page, info),

  recentDefinitions: (p, {page, order}, {db}, info) =>
    Definition.recentByLanguage(db, p.id, page, order, info),

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

  statistics: (p, _args, {db}) => LanguageStatsModel.byId(db, p.id),
};

const LanguageStats: ResolversFor<LanguageStatsType, LanguageStatsRow> = {
  lemmaCount: p => p.lemma_count,

  definitionCount: p => p.definition_count,

  partOfSpeechCount: p => p.part_of_speech_count,

  tagCount: p => p.tag_count,
};

const Query: ResolversFor<QueryType, null> = {
  languages: (_root, _args, {db}) => LanguageModel.all(db),

  language: (_root, {id}, {db}) => LanguageModel.byId(db, id),

  languageByName: (_root, {name}, {db}) => LanguageModel.byName(db, name),
};

const Mutation: Mutators = {
  addLanguage: mutator((_root, {data}, context) =>
    LanguageMut.insert(MutContext.from(context), data)
  ),

  editLanguage: mutator((_root, {id, data}, context) =>
    LanguageMut.update(MutContext.from(context), id, data)
  ),

  deleteLanguage: mutator((_root, {id}, context) =>
    LanguageMut.delete(MutContext.from(context), id)
  ),
};

export default {
  Language,
  LanguageStats,
  Query,
  Mutation,
};
