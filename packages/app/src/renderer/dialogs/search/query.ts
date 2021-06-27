/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  SearchScope,
  LemmaId,
  LanguageId,
  DefinitionId
} from "../../graphql-shared";

export default "query($query:String!,$scopes:[SearchScope!]!){search(params:{query:$query,scopes:$scopes}){nodes{__typename...on LemmaSearchResult{termSnippet{...SnippetFragment}lemma{id,term,definitions{partOfSpeech{name}}derivedDefinitions{inflectedForm{displayName}derivedFrom{term}}language{...LanguageFragment}}}...on DefinitionSearchResult{descriptionSnippet{...SnippetFragment}definition{id,term,partOfSpeech{name}language{...LanguageFragment}}}}}}fragment SnippetFragment on MatchingSnippet{partialStart,partialEnd,parts{isMatch,text}}fragment LanguageFragment on Language{id,name}" as Query<{
  query: string;
  scopes: SearchScope[];
}, {
  search: {
    nodes: ({
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
        definitions: {
          partOfSpeech: {
            name: string;
          };
        }[];
        derivedDefinitions: {
          inflectedForm: {
            displayName: string;
          };
          derivedFrom: {
            term: string;
          };
        }[];
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
      __typename: 'LanguageSearchResult' | 'PartOfSpeechSearchResult' | 'TagSearchResult';
    })[];
  } | null;
}>;

