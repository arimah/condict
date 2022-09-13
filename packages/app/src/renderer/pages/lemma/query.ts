/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LemmaId,
  LanguageId,
  DefinitionId,
  PartOfSpeechId,
  BlockKind,
  InflectedFormId,
  InflectionTableId,
  TagId
} from "../../graphql";

export default "query($id:LemmaId!){lemma(id:$id){id,term,language{id,name}definitions{id,partOfSpeech{id,name}description{...RichTextBlockFragment}}derivedDefinitions{derivedFrom{id,term}inflectedForm{id,displayName,inflectionTableLayout{inflectionTable{id,name}}}}tags{id,name}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Query<{
  id: LemmaId;
}, {
  lemma: {
    id: LemmaId;
    term: string;
    language: {
      id: LanguageId;
      name: string;
    };
    definitions: {
      id: DefinitionId;
      partOfSpeech: {
        id: PartOfSpeechId;
        name: string;
      };
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
    }[];
    derivedDefinitions: {
      derivedFrom: {
        id: DefinitionId;
        term: string;
      };
      inflectedForm: {
        id: InflectedFormId;
        displayName: string;
        inflectionTableLayout: {
          inflectionTable: {
            id: InflectionTableId;
            name: string;
          };
        };
      };
    }[];
    tags: {
      id: TagId;
      name: string;
    }[];
  } | null;
}>;

