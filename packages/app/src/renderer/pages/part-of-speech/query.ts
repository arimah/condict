/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  PartOfSpeechId,
  UtcInstant,
  LanguageId,
  DefinitionId,
  BlockKind,
  LemmaId
} from "../../graphql";

export default "query($id:PartOfSpeechId!){partOfSpeech(id:$id){name,timeCreated,timeUpdated,language{id,name}usedByDefinitions(page:{page:0,perPage:5}){page{totalCount,hasNext}nodes{id,term,description{...RichTextBlockFragment}timeCreated,timeUpdated}}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Query<{
  id: PartOfSpeechId;
}, {
  partOfSpeech: {
    name: string;
    timeCreated: UtcInstant;
    timeUpdated: UtcInstant;
    language: {
      id: LanguageId;
      name: string;
    };
    usedByDefinitions: {
      page: {
        totalCount: number;
        hasNext: boolean;
      };
      nodes: {
        id: DefinitionId;
        term: string;
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
        timeCreated: UtcInstant;
        timeUpdated: UtcInstant;
      }[];
    };
  } | null;
}>;

