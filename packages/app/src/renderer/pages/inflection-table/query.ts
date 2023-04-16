/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Query,
  InflectionTableId,
  UtcInstant,
  LanguageId,
  DefinitionId,
  BlockKind,
  LemmaId,
  PartOfSpeechId
} from "../../graphql";

export default "query($id:InflectionTableId!){inflectionTable(id:$id){name,timeCreated,timeUpdated,language{id,name}layout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{inflectionPattern,displayName}}...on InflectionTableHeaderCell{headerText}}}}oldLayouts{page{totalCount}}usedBy:usedByDefinitions(layout:ALL_LAYOUTS){page{totalCount,hasNext}nodes{definition{...DefinitionSummaryFragment}hasOldLayouts}}oldUsedBy:usedByDefinitions(layout:OLD_LAYOUTS){page{totalCount,hasNext}nodes{definition{...DefinitionSummaryFragment}}}}}fragment DefinitionSummaryFragment on Definition{id,term,partOfSpeech{name}description{...RichTextBlockFragment}timeCreated,timeUpdated}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Query<{
  id: InflectionTableId;
}, {
  inflectionTable: {
    name: string;
    timeCreated: UtcInstant;
    timeUpdated: UtcInstant;
    language: {
      id: LanguageId;
      name: string;
    };
    layout: {
      rows: {
        cells: ({
          rowSpan: number;
          columnSpan: number;
          inflectedForm: {
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
    oldLayouts: {
      page: {
        totalCount: number;
      };
    };
    usedBy: {
      page: {
        totalCount: number;
        hasNext: boolean;
      };
      nodes: {
        definition: {
          id: DefinitionId;
          term: string;
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
          timeCreated: UtcInstant;
          timeUpdated: UtcInstant;
        };
        hasOldLayouts: boolean;
      }[];
    };
    oldUsedBy: {
      page: {
        totalCount: number;
        hasNext: boolean;
      };
      nodes: {
        definition: {
          id: DefinitionId;
          term: string;
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
          timeCreated: UtcInstant;
          timeUpdated: UtcInstant;
        };
      }[];
    };
  } | null;
}>;

