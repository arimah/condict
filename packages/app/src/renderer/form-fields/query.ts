/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  LemmaId,
  DefinitionId,
  PartOfSpeechId,
  TagId
} from "../graphql";

export const LinkTargetQuery = "query LinkTargetQuery($query:String!){search(params:{query:$query,scopes:[SEARCH_LANGUAGES,SEARCH_LEMMAS,SEARCH_DEFINITIONS,SEARCH_PARTS_OF_SPEECH]}page:{page:0,perPage:50}){nodes{__typename...on LanguageSearchResult{nameSnippet{...SnippetFragment}language{...LanguageFragment}}...on LemmaSearchResult{termSnippet{...SnippetFragment}lemma{id,term,language{...LanguageFragment}}}...on DefinitionSearchResult{descriptionSnippet{...SnippetFragment}definition{id,term,partOfSpeech{name}language{...LanguageFragment}}}...on PartOfSpeechSearchResult{nameSnippet{...SnippetFragment}partOfSpeech{id,name,language{...LanguageFragment}}}}}}fragment SnippetFragment on MatchingSnippet{partialStart,partialEnd,parts{isMatch,text}}fragment LanguageFragment on Language{id,name}" as Query<{
  query: string;
}, {
  search: {
    nodes: ({
      __typename: 'LanguageSearchResult';
      nameSnippet: {
        partialStart: boolean;
        partialEnd: boolean;
        parts: {
          isMatch: boolean;
          text: string;
        }[];
      };
      language: {
        id: LanguageId;
        name: string;
      };
    } | {
      __typename: 'LemmaSearchResult';
      termSnippet: {
        partialStart: boolean;
        partialEnd: boolean;
        parts: {
          isMatch: boolean;
          text: string;
        }[];
      };
      lemma: {
        id: LemmaId;
        term: string;
        language: {
          id: LanguageId;
          name: string;
        };
      };
    } | {
      __typename: 'DefinitionSearchResult';
      descriptionSnippet: {
        partialStart: boolean;
        partialEnd: boolean;
        parts: {
          isMatch: boolean;
          text: string;
        }[];
      };
      definition: {
        id: DefinitionId;
        term: string;
        partOfSpeech: {
          name: string;
        };
        language: {
          id: LanguageId;
          name: string;
        };
      };
    } | {
      __typename: 'PartOfSpeechSearchResult';
      nameSnippet: {
        partialStart: boolean;
        partialEnd: boolean;
        parts: {
          isMatch: boolean;
          text: string;
        }[];
      };
      partOfSpeech: {
        id: PartOfSpeechId;
        name: string;
        language: {
          id: LanguageId;
          name: string;
        };
      };
    } | {
      __typename: 'TagSearchResult';
    })[];
  } | null;
}>;

export const SearchTagsQuery = "query SearchTagsQuery($query:String!){search(params:{query:$query,scopes:[SEARCH_TAGS]}page:{page:0,perPage:50}){nodes{__typename...on TagSearchResult{tag{id,name}}}}tag(name:$query){id,name}}" as Query<{
  query: string;
}, {
  search: {
    nodes: ({
      __typename: 'TagSearchResult';
      tag: {
        id: TagId;
        name: string;
      };
    } | {
      __typename: 'LanguageSearchResult' | 'LemmaSearchResult' | 'DefinitionSearchResult' | 'PartOfSpeechSearchResult';
    })[];
  } | null;
  tag: {
    id: TagId;
    name: string;
  } | null;
}>;

