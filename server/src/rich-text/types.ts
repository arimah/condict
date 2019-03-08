// NOTE: The types in this file must be kept in sync with GraphQL!
// See GraphQL for documentation comments.

export const enum BlockKind {
  PARAGRAPH = 'PARAGRAPH',
  HEADING_1 = 'HEADING_1',
  HEADING_2 = 'HEADING_2',
  OLIST_ITEM = 'OLIST_ITEM',
  ULIST_ITEM = 'ULIST_ITEM',
}

export interface BlockElement {
  kind: BlockKind;
  level: number;
  text: string;
  inlines?: InlineElement[] | null;
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

export type InlineElement = StyleInline | LinkInline;

export interface StyleInline {
  kind: Exclude<InlineKind, InlineKind.LINK>;
  start: number;
  end: number;
}

export interface LinkInline {
  kind: InlineKind.LINK;
  start: number;
  end: number;
  linkTarget: string;
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
