import {
  SearchIndex,
  SearchResultRow,
  LanguageSearchResultRow,
  LemmaSearchResultRow,
  DefinitionSearchResultRow,
  PartOfSpeechSearchResultRow,
  TagSearchResultRow,
  MatchingSnippet,
  Language,
  Lemma,
  Definition,
  PartOfSpeech,
  Tag,
} from '../../model';

import {
  GlobalSearchResult as GlobalSearchResultType,
  SearchInLanguageResult as SearchInLanguageResultType,
  LanguageSearchResult as LanguageSearchResultType,
  LemmaSearchResult as LemmaSearchResultType,
  DefinitionSearchResult as DefinitionSearchResultType,
  PartOfSpeechSearchResult as PartOfSpeechSearchResultType,
  TagSearchResult as TagSearchResultType,
  Query as QueryType,
} from '../types';

import {ResolversFor} from './types';

const GlobalSearchResult: ResolversFor<
  GlobalSearchResultType,
  SearchResultRow
> = {
  __resolveType(p) {
    switch (p.kind) {
      case 'language':
        return 'LanguageSearchResult';
      case 'lemma':
        return 'LemmaSearchResult';
      case 'definition':
        return 'DefinitionSearchResult';
      case 'part_of_speech':
        return 'PartOfSpeechSearchResult';
      case 'tag':
        return 'TagSearchResult';
    }
  },
};

const SearchInLanguageResult: ResolversFor<
  SearchInLanguageResultType,
  SearchResultRow
> = {
  __resolveType(p) {
    switch (p.kind) {
      case 'lemma':
        return 'LemmaSearchResult';
      case 'definition':
        return 'DefinitionSearchResult';
      case 'part_of_speech':
        return 'PartOfSpeechSearchResult';
      default:
        throw new Error(`Unexpected result kind for search-in-language: ${p.kind}`);
    }
  },
};

const LanguageSearchResult: ResolversFor<
  LanguageSearchResultType,
  LanguageSearchResultRow
> = {
  nameSnippet: p => MatchingSnippet.fromRaw(p.matching_snippet),

  language: (p, _args, {db}) => Language.byId(db, p.id),
};

const LemmaSearchResult: ResolversFor<
  LemmaSearchResultType,
  LemmaSearchResultRow
> = {
  termSnippet: p => MatchingSnippet.fromRaw(p.matching_snippet),

  lemma: (p, _args, {db}) => Lemma.byId(db, p.id),
};

const DefinitionSearchResult: ResolversFor<
  DefinitionSearchResultType,
  DefinitionSearchResultRow
> = {
  descriptionSnippet: p => MatchingSnippet.fromRaw(p.matching_snippet),

  definition: (p, _args, {db}) => Definition.byId(db, p.id),
};

const PartOfSpeechSearchResult: ResolversFor<
  PartOfSpeechSearchResultType,
  PartOfSpeechSearchResultRow
> = {
  nameSnippet: p => MatchingSnippet.fromRaw(p.matching_snippet),

  partOfSpeech: (p, _args, {db}) => PartOfSpeech.byId(db, p.id),
};

const TagSearchResult: ResolversFor<TagSearchResultType, TagSearchResultRow> = {
  nameSnippet: p => MatchingSnippet.fromRaw(p.matching_snippet),

  tag: (p, _args, {db}) => Tag.byId(db, p.id),
};

const Query: ResolversFor<QueryType, null> = {
  search: (_p, {params, page}, {db}, info) =>
    SearchIndex.search(
      db,
      params.query,
      params.scopes ?? null,
      {
        inLanguages: params.inLanguages ?? null,
        inPartsOfSpeech: params.inPartsOfSpeech ?? null,
        withTags: params.withTags ?? null,
        tagMatching: params.tagMatching ?? 'MATCH_ANY',
      },
      page,
      info
    ),
};

export default {
  GlobalSearchResult,
  SearchInLanguageResult,
  LanguageSearchResult,
  LemmaSearchResult,
  DefinitionSearchResult,
  PartOfSpeechSearchResult,
  TagSearchResult,
  Query,
};
