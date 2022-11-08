import {Location, Range} from 'slate';
import {ReactEditor} from 'slate-react';

import {HistoryEditor} from './history-editor';

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
  children: CustomText[];
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
  /** The type of resource that the link target points to. */
  readonly type: LinkTargetType;
};

export type LinkTargetType =
  | InternalLinkTargetType
  | ExternalLinkTargetType;

export type InternalLinkTargetType =
  | 'language'
  | 'lemma'
  | 'definition'
  | 'partOfSpeech'
  | 'tag';

export type ExternalLinkTargetType = 'url';

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

  focusWithSelection(selection: Range): void;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CondictEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export interface InlineMessages {
  /** "Formatting", toolbar group name. */
  formatGroup(): string;
  /** "Bold", toolbar button tooltip. */
  bold(): string;
  /** "Italic", toolbar button tooltip. */
  italic(): string;
  /** "Underline", toolbar button tooltip. */
  underline(): string;
  /** "Strike through", toolbar button tooltip. */
  strikethrough(): string;
  /** "Subscript", toolbar button tooltip. */
  subscript(): string;
  /** "Superscript", toolbar button tooltip. */
  superscript(): string;
}

export interface BlockMessages {
  /** "Headings", toolbar group name. */
  headingsGroup(): string;
  /** "Heading 1", toolbar button tooltip. */
  heading1(): string;
  /** "Heading 2", toolbar button tooltip. */
  heading2(): string;
  /** "List style", toolbar group name. */
  listStyleGroup(): string;
  /** "Bulleted list", toolbar button tooltip. */
  bulletedList(): string;
  /** "Numbered list", toolbar button tooltip. */
  numberedList(): string;
  /** "Increase indentation", toolbar button tooltip. */
  indent(): string;
  /** "Decrease indentation", toolbar button tooltip. */
  unindent(): string;
  /** "Insert phonetic writing", toolbar button tooltip. */
  insertIpa(): string;
}

export interface LinkMessages {
  /** "Link", toolbar group name. */
  linkGroup(): string;
  /** "Add/edit link", toolbar button tooltip. */
  addEditLink(): string;
  /** "Remove link", toolbar button tooltip. */
  removeLink(): string;
  /** Translates a link target type to a human-readable name. */
  linkTargetType(type: LinkTargetType): string;
}
