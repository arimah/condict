/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

import {
  Mutation,
  NewLanguageInput,
  LanguageId,
  BlockKind,
  LemmaId,
  DefinitionId,
  PartOfSpeechId,
  Query,
  EditLanguageInput,
  NewPartOfSpeechInput,
  EditPartOfSpeechInput,
  NewInflectionTableInput,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  EditInflectionTableInput,
  NewDefinitionInput,
  DefinitionInflectionTableId,
  EditDefinitionInput
} from "../graphql";

export const AddLanguageMut = "mutation AddLanguageMut($data:NewLanguageInput!){addLanguage(data:$data){id,name,description{...RichTextBlockFragment}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Mutation<{
  data: NewLanguageInput;
}, {
  addLanguage: {
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
  } | null;
}>;

export const EditLanguageQuery = "query EditLanguageQuery($id:LanguageId!){language(id:$id){id,name,description{...RichTextBlockFragment}statistics{lemmaCount,definitionCount,partOfSpeechCount}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Query<{
  id: LanguageId;
}, {
  language: {
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
    };
  } | null;
}>;

export const EditLanguageMut = "mutation EditLanguageMut($id:LanguageId!,$data:EditLanguageInput!){editLanguage(id:$id,data:$data){id}}" as Mutation<{
  id: LanguageId;
  data: EditLanguageInput;
}, {
  editLanguage: {
    id: LanguageId;
  } | null;
}>;

export const DeleteLanguageMut = "mutation DeleteLanguageMut($id:LanguageId!){deleteLanguage(id:$id)}" as Mutation<{
  id: LanguageId;
}, {
  deleteLanguage: boolean | null;
}>;

export const AddPartOfSpeechMut = "mutation AddPartOfSpeechMut($data:NewPartOfSpeechInput!){addPartOfSpeech(data:$data){id,name,language{id,name}}}" as Mutation<{
  data: NewPartOfSpeechInput;
}, {
  addPartOfSpeech: {
    id: PartOfSpeechId;
    name: string;
    language: {
      id: LanguageId;
      name: string;
    };
  } | null;
}>;

export const EditPartOfSpeechQuery = "query EditPartOfSpeechQuery($id:PartOfSpeechId!){partOfSpeech(id:$id){id,name,language{id,name}isInUse,usedByDefinitions{page{totalCount}}}}" as Query<{
  id: PartOfSpeechId;
}, {
  partOfSpeech: {
    id: PartOfSpeechId;
    name: string;
    language: {
      id: LanguageId;
      name: string;
    };
    isInUse: boolean;
    usedByDefinitions: {
      page: {
        totalCount: number;
      };
    };
  } | null;
}>;

export const EditPartOfSpeechMut = "mutation EditPartOfSpeechMut($id:PartOfSpeechId!,$data:EditPartOfSpeechInput!){editPartOfSpeech(id:$id,data:$data){id}}" as Mutation<{
  id: PartOfSpeechId;
  data: EditPartOfSpeechInput;
}, {
  editPartOfSpeech: {
    id: PartOfSpeechId;
  } | null;
}>;

export const DeletePartOfSpeechMut = "mutation DeletePartOfSpeechMut($id:PartOfSpeechId!){deletePartOfSpeech(id:$id)}" as Mutation<{
  id: PartOfSpeechId;
}, {
  deletePartOfSpeech: boolean | null;
}>;

export const AddInflectionTableMut = "mutation AddInflectionTableMut($data:NewInflectionTableInput!){addInflectionTable(data:$data){id,name,layout{id,stems...InflectionTableFragment}partOfSpeech{id,name,language{id,name}}}}fragment InflectionTableFragment on InflectionTableLayout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{id,inflectionPattern,deriveLemma,displayName,hasCustomDisplayName}}...on InflectionTableHeaderCell{headerText}}}}" as Mutation<{
  data: NewInflectionTableInput;
}, {
  addInflectionTable: {
    id: InflectionTableId;
    name: string;
    layout: {
      id: InflectionTableLayoutId;
      stems: string[];
      rows: {
        cells: ({
          rowSpan: number;
          columnSpan: number;
          inflectedForm: {
            id: InflectedFormId;
            inflectionPattern: string;
            deriveLemma: boolean;
            displayName: string;
            hasCustomDisplayName: boolean;
          };
        } | {
          rowSpan: number;
          columnSpan: number;
          headerText: string;
        })[];
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
  } | null;
}>;

export const EditInflectionTableQuery = "query EditInflectionTableQuery($id:InflectionTableId!){inflectionTable(id:$id){id,name,layout{isInUse...InflectionTableFragment}partOfSpeech{id,language{id}}isInUse,usedByDefinitions{page{totalCount}}}}fragment InflectionTableFragment on InflectionTableLayout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{id,inflectionPattern,deriveLemma,displayName,hasCustomDisplayName}}...on InflectionTableHeaderCell{headerText}}}}" as Query<{
  id: InflectionTableId;
}, {
  inflectionTable: {
    id: InflectionTableId;
    name: string;
    layout: {
      isInUse: boolean;
      rows: {
        cells: ({
          rowSpan: number;
          columnSpan: number;
          inflectedForm: {
            id: InflectedFormId;
            inflectionPattern: string;
            deriveLemma: boolean;
            displayName: string;
            hasCustomDisplayName: boolean;
          };
        } | {
          rowSpan: number;
          columnSpan: number;
          headerText: string;
        })[];
      }[];
    };
    partOfSpeech: {
      id: PartOfSpeechId;
      language: {
        id: LanguageId;
      };
    };
    isInUse: boolean;
    usedByDefinitions: {
      page: {
        totalCount: number;
      };
    };
  } | null;
}>;

export const EditInflectionTableMut = "mutation EditInflectionTableMut($id:InflectionTableId!,$data:EditInflectionTableInput!){editInflectionTable(id:$id,data:$data){id}}" as Mutation<{
  id: InflectionTableId;
  data: EditInflectionTableInput;
}, {
  editInflectionTable: {
    id: InflectionTableId;
  } | null;
}>;

export const DeleteInflectionTableMut = "mutation DeleteInflectionTableMut($id:InflectionTableId!){deleteInflectionTable(id:$id)}" as Mutation<{
  id: InflectionTableId;
}, {
  deleteInflectionTable: boolean | null;
}>;

export const AddDefinitionQuery = "query AddDefinitionQuery($lang:LanguageId!){language(id:$lang){...DefinitionFormPartsOfSpeechFragment}}fragment DefinitionFormPartsOfSpeechFragment on Language{partsOfSpeech{id,name,inflectionTables{id,name,layout{id,stems...DefinitionTableFragment}}}}fragment DefinitionTableFragment on InflectionTableLayout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{id,inflectionPattern,displayName}}...on InflectionTableHeaderCell{headerText}}}}" as Query<{
  lang: LanguageId;
}, {
  language: {
    partsOfSpeech: {
      id: PartOfSpeechId;
      name: string;
      inflectionTables: {
        id: InflectionTableId;
        name: string;
        layout: {
          id: InflectionTableLayoutId;
          stems: string[];
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
    }[];
  } | null;
}>;

export const AddDefinitionMut = "mutation AddDefinitionMut($data:NewDefinitionInput!){addDefinition(data:$data){id,term,description{...RichTextBlockFragment}language{id,name}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Mutation<{
  data: NewDefinitionInput;
}, {
  addDefinition: {
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
    language: {
      id: LanguageId;
      name: string;
    };
  } | null;
}>;

export const EditDefinitionQuery = "query EditDefinitionQuery($id:DefinitionId!){definition(id:$id){id,term,partOfSpeech{id}description{...RichTextBlockFragment}stems{name,value}inflectionTables{id,caption{inlines{...RichTextFragment}}customForms{inflectedForm{id}value}inflectionTable{id}inflectionTableLayout{id,isCurrent,stems...DefinitionTableFragment}}tags{name}language{id...DefinitionFormPartsOfSpeechFragment}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}fragment DefinitionTableFragment on InflectionTableLayout{rows{cells{rowSpan,columnSpan...on InflectionTableDataCell{inflectedForm{id,inflectionPattern,displayName}}...on InflectionTableHeaderCell{headerText}}}}fragment DefinitionFormPartsOfSpeechFragment on Language{partsOfSpeech{id,name,inflectionTables{id,name,layout{id,stems...DefinitionTableFragment}}}}" as Query<{
  id: DefinitionId;
}, {
  definition: {
    id: DefinitionId;
    term: string;
    partOfSpeech: {
      id: PartOfSpeechId;
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
    stems: {
      name: string;
      value: string;
    }[];
    inflectionTables: {
      id: DefinitionInflectionTableId;
      caption: {
        inlines: {
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
      };
      inflectionTableLayout: {
        id: InflectionTableLayoutId;
        isCurrent: boolean;
        stems: string[];
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
    tags: {
      name: string;
    }[];
    language: {
      id: LanguageId;
      partsOfSpeech: {
        id: PartOfSpeechId;
        name: string;
        inflectionTables: {
          id: InflectionTableId;
          name: string;
          layout: {
            id: InflectionTableLayoutId;
            stems: string[];
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
      }[];
    };
  } | null;
}>;

export const EditDefinitionMut = "mutation EditDefinitionMut($id:DefinitionId!,$data:EditDefinitionInput!){editDefinition(id:$id,data:$data){id,term,lemma{id}language{id,name}}}" as Mutation<{
  id: DefinitionId;
  data: EditDefinitionInput;
}, {
  editDefinition: {
    id: DefinitionId;
    term: string;
    lemma: {
      id: LemmaId;
    };
    language: {
      id: LanguageId;
      name: string;
    };
  } | null;
}>;

export const DeleteDefinitionMut = "mutation DeleteDefinitionMut($id:DefinitionId!){deleteDefinition(id:$id)}" as Mutation<{
  id: DefinitionId;
}, {
  deleteDefinition: boolean | null;
}>;

