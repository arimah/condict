import {LanguageId} from '../model/language/types';
import {LemmaId} from '../model/lemma/types';
import {DefinitionId} from '../model/definition/types';
import {PartOfSpeechId} from '../model/part-of-speech/types';

// NOTE: The types in this file must be kept in sync with GraphQL!
// See GraphQL for documentation comments.

export const enum BlockKind {
  PARAGRAPH = 'PARAGRAPH',
  HEADING_1 = 'HEADING_1',
  HEADING_2 = 'HEADING_2',
  OLIST_ITEM = 'OLIST_ITEM',
  ULIST_ITEM = 'ULIST_ITEM',
}

export type BlockElementJson = {
  kind: BlockKind;
  level?: number;
  text: string;
  inlines?: InlineElementJson[];
};

export const enum InlineKind {
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  UNDERLINE = 'UNDERLINE',
  STRIKETHROUGH = 'STRIKETHROUGH',
  SUPERSCRIPT = 'SUPERSCRIPT',
  SUBSCRIPT = 'SUBSCRIPT',
  LINK = 'LINK',
}

export type InlineElementJson = StyleInlineJson | LinkInlineJson;

export type StyleInlineJson = {
  kind: Exclude<InlineKind, InlineKind.LINK>;
  start: number;
  end: number;
};

export type LinkInlineJson = {
  kind: InlineKind.LINK;
  start: number;
  end: number;
  linkTarget: string;
};

export type TableCaptionJson = {
  text: string;
  inlines?: InlineElementJson[];
};

export type BlockElementInput = {
  kind: BlockKind;
  level?: number | null;
  text: string;
  inlines?: InlineElementInput[] | null;
};

export type InlineElementInput = {
  kind: InlineKind;
  start: number;
  end: number;
  linkTarget?: string | null;
};

export type TableCaptionInput = {
  text: string;
  inlines?: InlineElementInput[] | null;
};

export const enum CondictLinkType {
  LANGUAGE = 'language',
  LEMMA = 'lemma',
  DEFINITION = 'definition',
  PART_OF_SPEECH = 'part-of-speech',
}

export type CondictLink
  = LanguageLink
  | LemmaLink
  | DefinitionLink
  | PartOfSpeechLink;

export type LanguageLink = {
  type: CondictLinkType.LANGUAGE;
  id: LanguageId;
};

export type LemmaLink = {
  type: CondictLinkType.LEMMA;
  id: LemmaId;
};

export type DefinitionLink = {
  type: CondictLinkType.DEFINITION;
  id: DefinitionId;
};

export type PartOfSpeechLink = {
  type: CondictLinkType.PART_OF_SPEECH;
  id: PartOfSpeechId;
};
