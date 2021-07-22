import {
  BlockKind,
  LanguageId,
  LemmaId,
  DefinitionId,
  PartOfSpeechId,
} from '../../graphql';

export type HeadingType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface BlockFields {
  readonly kind: BlockKind;
  readonly level: number;
  readonly inlines: readonly InlineFields[];
}

export type InlineFields = TextFields | LinkFields;

export interface TextFields extends FormattedText {
  readonly __typename: 'FormattedText';
}

export interface FormattedText {
  readonly text: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
  readonly strikethrough: boolean;
  readonly subscript: boolean;
  readonly superscript: boolean;
}

export interface LinkFields {
  readonly __typename: 'LinkInline';
  readonly linkTarget: string;
  readonly internalLinkTarget: InternalLinkTargetFields | null;
  readonly inlines: readonly FormattedText[];
}

export type InternalLinkTargetFields =
  | LanguageTargetFields
  | LemmaTargetFields
  | DefinitionTargetFields
  | PartOfSpeechTargetFields

export interface LanguageTargetFields {
  readonly __typename: 'LanguageLinkTarget';
  readonly language: LanguageFields | null;
}

export interface LemmaTargetFields {
  readonly __typename: 'LemmaLinkTarget';
  readonly lemma: {
    readonly id: LemmaId;
    readonly term: string;
    readonly language: LanguageFields;
  } | null;
}

export interface DefinitionTargetFields {
  readonly __typename: 'DefinitionLinkTarget';
  readonly definition: {
    readonly id: DefinitionId;
    readonly term: string;
    readonly language: LanguageFields;
  } | null;
}

export interface PartOfSpeechTargetFields {
  readonly __typename: 'PartOfSpeechLinkTarget';
  readonly partOfSpeech: {
    readonly id: PartOfSpeechId;
    readonly name: string;
    readonly language: LanguageFields;
  } | null;
}

export interface LanguageFields {
  readonly id: LanguageId;
  readonly name: string;
}
