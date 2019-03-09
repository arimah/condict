// NOTE: The types in this file must be kept in sync with GraphQL!
// See GraphQL for documentation comments.

export const enum BlockKind {
  PARAGRAPH = 'PARAGRAPH',
  HEADING_1 = 'HEADING_1',
  HEADING_2 = 'HEADING_2',
  OLIST_ITEM = 'OLIST_ITEM',
  ULIST_ITEM = 'ULIST_ITEM',
}

export interface BlockElementJson {
  kind: BlockKind;
  level?: number;
  text: string;
  inlines?: InlineElementJson[];
}

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

export interface StyleInlineJson {
  kind: Exclude<InlineKind, InlineKind.LINK>;
  start: number;
  end: number;
}

export interface LinkInlineJson {
  kind: InlineKind.LINK;
  start: number;
  end: number;
  linkTarget: string;
}

export interface TableCaptionJson {
  text: string;
  inlines?: InlineElementJson[];
}

export interface BlockElementInput {
  kind: BlockKind;
  level?: number | null;
  text: string;
  inlines?: InlineElementInput[] | null;
}

export interface InlineElementInput {
  kind: InlineKind;
  start: number;
  end: number;
  linkTarget?: string | null;
}

export interface TableCaptionInput {
  text: string;
  inlines?: InlineElementInput[] | null;
}

export const enum CondictLinkTarget {
  LANGUAGE = 'language',
  LEMMA = 'lemma',
  DEFINITION = 'definition',
  PART_OF_SPEECH = 'part-of-speech',
}

export interface CondictLink {
  type: CondictLinkTarget;
  id: number;
}
