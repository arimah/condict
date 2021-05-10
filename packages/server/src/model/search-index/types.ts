import {
  LanguageId,
  LemmaId,
  DefinitionId,
  PartOfSpeechId,
  TagId,
  MatchingMode,
} from '../../graphql';

export type SearchResultRow =
  | LanguageSearchResultRow
  | LemmaSearchResultRow
  | DefinitionSearchResultRow
  | PartOfSpeechSearchResultRow
  | TagSearchResultRow;

// These types have names for snippet fields that are deliberately chosen to be
// different from the GraphQL schema's field names, so we get type errors if we
// forget to implement resolvers for them.

export type LanguageSearchResultRow = {
  kind: 'language';
  id: LanguageId;
  /** Name snippet. */
  matching_snippet: string;
  score: number;
};

export type LemmaSearchResultRow = {
  kind: 'lemma';
  id: LemmaId;
  /** Term snippet. */
  matching_snippet: string;
  score: number;
};

export type DefinitionSearchResultRow = {
  kind: 'definition';
  id: DefinitionId;
  /** Description snippet. */
  matching_snippet: string;
  score: number;
};

export type PartOfSpeechSearchResultRow = {
  kind: 'part_of_speech';
  id: PartOfSpeechId;
  /** Name snippet. */
  matching_snippet: string;
  score: number;
};

export type TagSearchResultRow = {
  kind: 'tag';
  id: TagId;
  /** Name snippet. */
  matching_snippet: string;
  score: number;
};

export type SearchFilters = {
  inLanguages: readonly LanguageId[] | null;
  inPartsOfSpeech: readonly PartOfSpeechId[] | null;
  withTags: readonly TagId[] | null;
  tagMatching: MatchingMode;
};

export type LemmaSearchIndexInput = {
  readonly id: LemmaId;
  readonly term: string;
};

export type TagSearchIndexInput = {
  readonly id: TagId;
  readonly name: string;
};
