export type BlockKind =
  | 'PARAGRAPH'
  | 'HEADING_1'
  | 'HEADING_2'
  | 'OLIST_ITEM'
  | 'ULIST_ITEM';

export interface BlockElement {
  readonly kind: BlockKind;
  readonly level: number;
  readonly inlines: readonly InlineElement[];
}

export type InlineElement = FormattedText | LinkInline;

export interface FormattedText {
  readonly text: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
  readonly strikethrough: boolean;
  readonly subscript: boolean;
  readonly superscript: boolean;
}

export interface LinkInline {
  readonly linkTarget: string;
  readonly internalLinkTarget: InternalLinkTarget | null;
  readonly inlines: readonly FormattedText[];
}

export type InternalLinkTarget =
  | LanguageLinkTarget
  | LemmaLinkTarget
  | DefinitionLinkTarget
  | PartOfSpeechLinkTarget;

export interface LanguageLinkTarget {
  readonly __typename: 'LanguageLinkTarget';
  readonly language: {
    readonly name: string;
  } | null;
}

export interface LemmaLinkTarget {
  readonly __typename: 'LemmaLinkTarget';
  readonly lemma: {
    readonly term: string;
  } | null;
}

export interface DefinitionLinkTarget {
  readonly __typename: 'DefinitionLinkTarget';
  readonly definition: {
    readonly term: string;
  } | null;
}

export interface PartOfSpeechLinkTarget {
  readonly __typename: 'PartOfSpeechLinkTarget';
  readonly partOfSpeech: {
    readonly name: string;
  } | null;
}

export interface TableCaption {
  readonly inlines: readonly FormattedText[];
}

export interface BlockElementInput {
  kind: BlockKind;
  level?: number;
  inlines: InlineElementInput[];
}

export interface InlineElementInput {
  text?: FormattedTextInput;
  link?: LinkInlineInput;
}

export interface FormattedTextInput {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
}

export interface LinkInlineInput {
  linkTarget: string;
  inlines: FormattedTextInput[];
}

export interface TableCaptionInput {
  inlines: FormattedTextInput[];
}
