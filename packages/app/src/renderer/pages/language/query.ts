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
  TagId,
  Mutation,
  EditLanguageInput,
  NewPartOfSpeechInput
} from "../../graphql";

export default "query($id:LanguageId!){language(id:$id){name,description{...RichTextBlockFragment}lemmaCount,firstLemma{term}lastLemma{term}recentDefinitions(page:{page:0,perPage:5}){nodes{id,term,partOfSpeech{name}description{...RichTextBlockFragment}timeCreated,timeUpdated}}partsOfSpeech{id,name,statistics{inflectionTableCount,definitionCount}timeCreated,timeUpdated}tags(page:{page:0,perPage:100}){page{page,hasNext}nodes{id,name}}}}fragment RichTextBlockFragment on BlockElement{kind,level,inlines{__typename...RichTextFragment...RichLinkFragment}}fragment RichTextFragment on FormattedText{text,bold,italic,underline,strikethrough,subscript,superscript}fragment RichLinkFragment on LinkInline{linkTarget,internalLinkTarget{__typename...on LanguageLinkTarget{language{id,name}}...on LemmaLinkTarget{lemma{id,term,language{id,name}}}...on DefinitionLinkTarget{definition{id,term,language{id,name}}}...on PartOfSpeechLinkTarget{partOfSpeech{id,name,language{id,name}}}}inlines{...RichTextFragment}}" as Query<{
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
    recentDefinitions: {
      nodes: {
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
      }[];
    };
    partsOfSpeech: {
      id: PartOfSpeechId;
      name: string;
      statistics: {
        inflectionTableCount: number;
        definitionCount: number;
      };
      timeCreated: UtcInstant;
      timeUpdated: UtcInstant;
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

