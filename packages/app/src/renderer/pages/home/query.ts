/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  BlockKind,
  LemmaId,
  DefinitionId,
  PartOfSpeechId,
  TagId,
  UtcInstant,
  InflectionTableId,
  Mutation,
  NewLanguageInput
} from "../../graphql";

export default "query($tagsPage:Int!){languages{id,name,description{...RichTextBlockFragment}statistics{lemmaCount,definitionCount,partOfSpeechCount,tagCount}}tags(page:{page:$tagsPage,perPage:100}){page{page,hasNext}nodes{id,name}}recentChanges(page:{page:0,perPage:8}){nodes{__typename,timeCreated,timeUpdated...on Language{languageId:id,name}...on Definition{definitionId:id,term,language{id,name}}...on PartOfSpeech{partOfSpeechId:id,name,language{id,name}}...on InflectionTable{inflectionTableId:id,name,partOfSpeech{id,name,language{id,name}}}}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Query<{
  tagsPage: number;
}, {
  languages: {
    id: LanguageId;
    name: string;
    description: {
      kind: BlockKind;
      level: number;
      inlines: ({
        __typename: 'FormattedText';
        text: string;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        strikethrough: boolean;
        subscript: boolean;
        superscript: boolean;
      } | {
        __typename: 'LinkInline';
        linkTarget: string;
        internalLinkTarget: ({
          __typename: 'LanguageLinkTarget';
          language: {
            id: LanguageId;
            name: string;
          } | null;
        } | {
          __typename: 'LemmaLinkTarget';
          lemma: {
            id: LemmaId;
            term: string;
            language: {
              id: LanguageId;
              name: string;
            };
          } | null;
        } | {
          __typename: 'DefinitionLinkTarget';
          definition: {
            id: DefinitionId;
            term: string;
            language: {
              id: LanguageId;
              name: string;
            };
          } | null;
        } | {
          __typename: 'PartOfSpeechLinkTarget';
          partOfSpeech: {
            id: PartOfSpeechId;
            name: string;
            language: {
              id: LanguageId;
              name: string;
            };
          } | null;
        }) | null;
        inlines: {
          text: string;
          bold: boolean;
          italic: boolean;
          underline: boolean;
          strikethrough: boolean;
          subscript: boolean;
          superscript: boolean;
        }[];
      })[];
    }[];
    statistics: {
      lemmaCount: number;
      definitionCount: number;
      partOfSpeechCount: number;
      tagCount: number;
    };
  }[];
  tags: {
    page: {
      page: number;
      hasNext: boolean;
    };
    nodes: {
      id: TagId;
      name: string;
    }[];
  };
  recentChanges: {
    nodes: ({
      __typename: 'Language';
      timeCreated: UtcInstant;
      timeUpdated: UtcInstant;
      languageId: LanguageId;
      name: string;
    } | {
      __typename: 'Definition';
      timeCreated: UtcInstant;
      timeUpdated: UtcInstant;
      definitionId: DefinitionId;
      term: string;
      language: {
        id: LanguageId;
        name: string;
      };
    } | {
      __typename: 'PartOfSpeech';
      timeCreated: UtcInstant;
      timeUpdated: UtcInstant;
      partOfSpeechId: PartOfSpeechId;
      name: string;
      language: {
        id: LanguageId;
        name: string;
      };
    } | {
      __typename: 'InflectionTable';
      timeCreated: UtcInstant;
      timeUpdated: UtcInstant;
      inflectionTableId: InflectionTableId;
      name: string;
      partOfSpeech: {
        id: PartOfSpeechId;
        name: string;
        language: {
          id: LanguageId;
          name: string;
        };
      };
    })[];
  } | null;
}>;

export const AddLanguageMut = "mutation AddLanguageMut($data:NewLanguageInput!){addLanguage(data:$data){id,name}}" as Mutation<{
  data: NewLanguageInput;
}, {
  addLanguage: {
    id: LanguageId;
    name: string;
  } | null;
}>;

