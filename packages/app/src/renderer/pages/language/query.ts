/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  LanguageId,
  BlockKind,
  LemmaId,
  DefinitionId,
  PartOfSpeechId,
  UtcInstant,
  InflectionTableId,
  TagId
} from "../../graphql";

export default "query($id:LanguageId!){language(id:$id){name,description{...RichTextBlockFragment}lemmaCount,firstLemma{term}lastLemma{term}timeCreated,timeUpdated,recentDefinitions(page:{page:0,perPage:5}){nodes{id,term,timeCreated,timeUpdated,partOfSpeech{name}description{...RichTextBlockFragment}}}partsOfSpeech{id,name,timeCreated,timeUpdated,statistics{definitionCount}}inflectionTables{id,name,timeCreated,timeUpdated,usedByDefinitions{page{totalCount}}}tags(page:{page:0,perPage:100}){page{page,hasNext}nodes{id,name}}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Query<{
  id: LanguageId;
}, {
  language: {
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
    lemmaCount: number;
    firstLemma: {
      term: string;
    } | null;
    lastLemma: {
      term: string;
    } | null;
    timeCreated: UtcInstant;
    timeUpdated: UtcInstant;
    recentDefinitions: {
      nodes: {
        id: DefinitionId;
        term: string;
        timeCreated: UtcInstant;
        timeUpdated: UtcInstant;
        partOfSpeech: {
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
    };
    partsOfSpeech: {
      id: PartOfSpeechId;
      name: string;
      timeCreated: UtcInstant;
      timeUpdated: UtcInstant;
      statistics: {
        definitionCount: number;
      };
    }[];
    inflectionTables: {
      id: InflectionTableId;
      name: string;
      timeCreated: UtcInstant;
      timeUpdated: UtcInstant;
      usedByDefinitions: {
        page: {
          totalCount: number;
        };
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
  } | null;
}>;

