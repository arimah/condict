import {Editor, Location, Span, Element, Node, NodeEntry} from 'slate';

import {BlockType, InlineType, isListType} from './types';

/** The (inclusive) maximum indentation level. */
export const MaxIndent = 8;

export const getMinIndent = (element: Element): number =>
  // List items are basically forced to be indented at least one step.
  // This creates some extra headache, but makes all the formatting and
  // list numbering a thousand times simpler.
  isListType(element.type || 'paragraph') ? 1 : 0;

export const isBlock = (n: Node, editor: Editor): n is Element =>
  Element.isElement(n) && !editor.isInline(n);

export const isLink = (n: Node): n is Element =>
  Element.isElement(n) && n.type === 'link';

export const blocks = (editor: Editor): Iterable<NodeEntry<Element>> =>
  Editor.nodes(editor, {
    match: (n): n is Element => isBlock(n, editor),
  });

const anyMatch = (iterable: Iterable<any>): boolean => {
  const iter = iterable[Symbol.iterator]();
  return !iter.next().done;
};

export const canIndent = (editor: Editor): boolean =>
  anyMatch(Editor.nodes(editor, {
    match: n =>
      isBlock(n, editor) && (
        n.indent === undefined ||
        n.indent < MaxIndent
      ),
  }));

export const canUnindent = (editor: Editor): boolean =>
  anyMatch(Editor.nodes(editor, {
    match: n =>
      isBlock(n, editor) &&
      n.indent !== undefined &&
      n.indent > getMinIndent(n),
  }));

export const isBlockActive = (editor: Editor, type: BlockType): boolean =>
  anyMatch(Editor.nodes(editor, {
    match: n => n.type === type,
    mode: 'all',
  }));

export const isInlineActive = (editor: Editor, type: InlineType): boolean =>
  anyMatch(Editor.nodes(editor, {
    match: n => n.type === type,
  }));

export const firstMatchingNode = <T extends Node = Node>(
  editor: Editor,
  options: {
    at?: Location | Span,
    match?: ((node: Node) => node is T) | ((node: Node) => boolean)
  } = {}
): T | null => {
  const iter = Editor.nodes(editor, options)[Symbol.iterator]();
  const item = iter.next();
  return !item.done ? item.value[0] : null;
};
