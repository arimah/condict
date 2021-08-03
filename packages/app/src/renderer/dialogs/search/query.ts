/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  SearchScope,
  LanguageId,
  LemmaId,
  DefinitionId
} from "../../graphql";

export default "query($query:String!,$scopes:[SearchScope!]!,$language:[LanguageId!]){search(params:{query:$query,scopes:$scopes,inLanguages:$language}){nodes{__typename...on LemmaSearchResult{termSnippet{...SnippetFragment}lemma{id,term,definitions{partOfSpeech{name}}derivedDefinitions{inflectedForm{displayName}derivedFrom{term}}language{...LanguageFragment}}}...on DefinitionSearchResult{descriptionSnippet{...SnippetFragment}definition{id,term,partOfSpeech{name}language{...LanguageFragment}}}}}}fragment SnippetFragment on MatchingSnippet{partialStart,partialEnd,parts{isMatch,text}}fragment LanguageFragment on Language{id,name}" as Query<{
  query: string;
  scopes: SearchScope[];
  language?: LanguageId[] | null | undefined;
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

