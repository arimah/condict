import {Location, Range} from 'slate';
import {ReactEditor} from 'slate-react';
import {HistoryEditor} from 'slate-history';

export interface ParagraphElement {
  type: 'paragraph';
  indent?: number;
  children: Children;
}

export type HeadingType =
  | 'heading1'
  | 'heading2';

export const isHeadingType = (type: ElementType): type is HeadingType =>
  type === 'heading1' ||
  type === 'heading2';

export type HeadingElement = {
  type: HeadingType;
  indent?: number;
  children: Children;
};

export type ListType =
  | 'numberListItem'
  | 'bulletListItem';

export const isListType = (type: ElementType): type is ListType =>
  type === 'numberListItem' ||
  type === 'bulletListItem';

export interface ListElement {
  type: ListType;
  indent?: number;
  children: Children;
}

export type BlockType =
  | 'paragraph'
  | HeadingType
  | ListType;

export type BlockElement =
  | ParagraphElement
  | HeadingElement
  | ListElement;

export interface LinkElement {
  type: 'link';
  target: LinkTarget;
  children: Children;
}

export type LinkTarget = {
  /** The URL of the link. */
  readonly url: string;
  /**
   * The name of the link target. For internal links, this is the name of
   * the target item. For external links, this field is either empty or set
   * to the URL.
   */
  readonly name?: string;
  /**
   * A descriptive name for the link type, such as 'defnition', 'lemma',
   * or 'web address'.
   */
  readonly type: string;
};

export type InlineElement = LinkElement;

export type InlineType = 'link';

export type CustomElement = BlockElement | InlineElement;

export type ElementType = BlockType | InlineType;

export type Children = (InlineElement | CustomText)[];

export type MarkType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'superscript'
  | 'subscript';

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
}

export interface CondictEditor extends ReactEditor, HistoryEditor {
  /** The selection that the editor had before losing focus. */
  blurSelection: Range | null;

  formatBlock(
    format: BlockType,
    options?: {
      at?: Location;
    }
  ): void;
  indent(
    options?: {
      at?: Location;
    }
  ): void;
  unindent(
    options?: {
      at?: Location;
    }
  ): void;
  wrapLink(
    target: LinkTarget,
    options?: {
      at?: Location;
    }
  ): void;
  removeLink(
    options?: {
      at?: Location;
    }
  ): void;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CondictEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
