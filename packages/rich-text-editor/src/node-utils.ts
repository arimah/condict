import {Editor, Location, Span, Element, Node, NodeEntry} from 'slate';

import {
  BlockElement,
  BlockType,
  LinkElement,
  InlineElement,
  InlineType,
} from './types';

/** The (inclusive) maximum indentation level. */
export const MaxIndent = 8;

export const isBlock = (n: Node, editor: Editor): n is BlockElement =>
  Element.isElement(n) && !editor.isInline(n);

export const isInline = (n: Node, editor: Editor): n is InlineElement =>
  Element.isElement(n) && editor.isInline(n);

export const isLink = (n: Node): n is LinkElement =>
  Element.isElement(n) && n.type === 'link';

export const blocks = (
  editor: Editor,
  options: {
    at?: Location | Span;
  } = {}
): Iterable<NodeEntry<BlockElement>> =>
  Editor.nodes(editor, {
    ...options,
    match: (n): n is BlockElement => isBlock(n, editor),
  });

const anyMatch = (iterable: Generator<unknown>): boolean =>
  !iterable.next().done;

export const canIndent = (
  editor: Editor,
  options: {
    at?: Location | Span;
  } = {}
): boolean =>
  anyMatch(Editor.nodes(editor, {
    ...options,
    match: n =>
      isBlock(n, editor) && (
        n.indent === undefined ||
        n.indent < MaxIndent
      ),
  }));

export const canUnindent = (
  editor: Editor,
  options: {
    at?: Location | Span;
  } = {}
): boolean =>
  anyMatch(Editor.nodes(editor, {
    ...options,
    match: n =>
      isBlock(n, editor) &&
      n.indent !== undefined &&
      n.indent > 0,
  }));

export const isBlockActive = (
  editor: Editor,
  type: BlockType,
  options: {
    at?: Location | Span;
  } = {}
): boolean =>
  anyMatch(Editor.nodes(editor, {
    ...options,
    match: n => isBlock(n, editor) && n.type === type,
    mode: 'all',
  }));

export const isInlineActive = (
  editor: Editor,
  type: InlineType,
  options: {
    at?: Location | Span;
  } = {}
): boolean =>
  anyMatch(Editor.nodes(editor, {
    ...options,
    match: n => isInline(n, editor) && n.type === type,
  }));

export const firstMatchingNode = <T extends Node = Node>(
  editor: Editor,
  options: {
    at?: Location | Span;
    match?: ((node: Node) => node is T) | ((node: Node) => boolean);
  } = {}
): T | null => {
  const iter = Editor.nodes(editor, options);
  const item = iter.next();
  return !item.done ? item.value[0] : null;
};
