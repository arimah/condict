/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  DefinitionId,
  BlockKind,
  LanguageId,
  LemmaId,
  PartOfSpeechId,
  DefinitionInflectionTableId,
  InflectedFormId,
  InflectionTableId,
  UtcInstant,
  TagId
} from "../../graphql";

export default "query($id:DefinitionId!){definition(id:$id){term,description{...RichTextBlockFragment}partOfSpeech{id,name}stems{name,value}inflectionTables{id,caption{inlines{__typename...RichTextFragment}}customForms{inflectedForm{id}value}inflectionTable{id,name}inflectionTableLayout{...DefinitionTableFragment}}timeCreated,timeUpdated,tags{id,name}lemma{id,definitions{id}}language{id,name}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}fragment DefinitionTableFragment on InflectionTableLayout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{id,inflectionPattern,displayName}}...on InflectionTableHeaderCell{headerText}}}}" as Query<{
  id: DefinitionId;
}, {
  definition: {
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
    partOfSpeech: {
      id: PartOfSpeechId;
      name: string;
    };
    stems: {
      name: string;
      value: string;
    }[];
    inflectionTables: {
      id: DefinitionInflectionTableId;
      caption: {
        inlines: {
          __typename: 'FormattedText';
          text: string;
          bold: boolean;
          italic: boolean;
          underline: boolean;
          strikethrough: boolean;
          subscript: boolean;
          superscript: boolean;
        }[];
      } | null;
      customForms: {
        inflectedForm: {
          id: InflectedFormId;
        };
        value: string;
      }[];
      inflectionTable: {
        id: InflectionTableId;
        name: string;
      };
      inflectionTableLayout: {
        rows: {
          cells: ({
            rowSpan: number;
            columnSpan: number;
            inflectedForm: {
              id: InflectedFormId;
              inflectionPattern: string;
              displayName: string;
            };
          } | {
            rowSpan: number;
            columnSpan: number;
            headerText: string;
          })[];
        }[];
      };
    }[];
    timeCreated: UtcInstant;
    timeUpdated: UtcInstant;
    tags: {
      id: TagId;
      name: string;
    }[];
    lemma: {
      id: LemmaId;
      definitions: {
        id: DefinitionId;
      }[];
    };
    language: {
      id: LanguageId;
      name: string;
    };
  } | null;
}>;

