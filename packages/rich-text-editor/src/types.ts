import {Range} from 'slate';
import {ReactEditor} from 'slate-react';
import {HistoryEditor} from 'slate-history';

// Note: Slate's interfaces are extended in ./slate.d.ts

export type ListType =
  | 'numberListItem'
  | 'bulletListItem';

export type HeadingType =
  | 'heading1'
  | 'heading2';

export type BlockType =
  | 'paragraph'
  | HeadingType
  | ListType;

export type InlineType = 'link';

export type ElementType = BlockType | InlineType;

export const isListType = (type: ElementType): type is ListType =>
  type === 'numberListItem' ||
  type === 'bulletListItem';

export const isHeadingType = (type: ElementType): type is HeadingType =>
  type === 'heading1' ||
  type === 'heading2';

export type MarkType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'superscript'
  | 'subscript';

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

export interface CondictEditor extends ReactEditor, HistoryEditor {
  /** The selection that the editor had before losing focus. */
  blurSelection: Range | null;

  formatBlock(format: BlockType): void;
  indent(): void;
  unindent(): void;
  wrapLink(target: LinkTarget, at?: Range | null): void;
  removeLink(): void;
}
