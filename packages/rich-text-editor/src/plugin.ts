import {
  Transforms,
  Editor,
  Element,
  Text,
  Range,
  createEditor as createSlateEditor,
} from 'slate';
import {ReactEditor, useSlate, withReact} from 'slate-react';
import {HistoryEditor, withHistory} from 'slate-history';

import {
  MaxIndent,
  getMinIndent,
  isLink,
  isBlockActive,
  blocks,
} from './node-utils';
import {CondictEditor, BlockType, LinkTarget, isListType} from './types';

const LineBreak = /[\n\r\u2028\u2029]/g;

const withCondict = (
  baseEditor: ReactEditor & HistoryEditor,
  options: {
    singleLine?: boolean;
  } = {}
): CondictEditor => {
  const {singleLine = false} = options;

  // Let's get correct typings for Condict-specific functionality.
  const editor = baseEditor as CondictEditor;

  editor.blurSelection = editor.selection;

  if (singleLine) {
    const {normalizeNode} = editor;
    editor.normalizeNode = entry => {
      const [node, path] = entry;

      if (path.length === 1 && path[0] > 0) {
        Transforms.mergeNodes(editor, {at: path});
        return;
      }

      if (Text.isText(node) && LineBreak.test(node.text)) {
        const newText = node.text.replace(LineBreak, '');
        Transforms.setNodes(editor, {text: newText}, {at: path});
        return;
      }

      if (Element.isElement(node) && node.type === 'link') {
        Transforms.unwrapNodes(editor, {at: path});
      }

      normalizeNode(entry);
    };
  }

  const {isInline, apply} = editor;
  editor.isInline = element => element.type === 'link' || isInline(element);

  editor.apply = operation => {
    if (
      operation.type === 'set_selection' &&
      operation.newProperties !== null &&
      !Range.isRange(operation.newProperties)
    ) {
      // Fill in partial set_selection operations with properties from the
      // current selection. Incomplete set_selection operations can sometimes
      // mess up the editor history.
      operation.properties = {
        ...editor.selection,
        ...operation.properties,
      };
      operation.newProperties = {
        ...editor.selection,
        ...operation.newProperties,
      };
    }
    apply(operation);
  };

  editor.formatBlock = (format, options) => {
    const targetType = isBlockActive(editor, format, options)
      ? 'paragraph'
      : format;
    const isList = isListType(targetType);

    Editor.withoutNormalizing(editor, () => {
      for (const [block, path] of blocks(editor, options)) {
        const wasList = isListType(block.type || 'paragraph');

        const oldIndent = block.indent || 0;
        const indent =
          // Lists have one level of extra indentation.
          // non-list -> list: indent += 1 (up to MaxIndent)
          !wasList && isList ? Math.min(MaxIndent, oldIndent + 1) :
          // list -> non-list: indent -= 1
          wasList && !isList ? Math.max(0, oldIndent - 1) :
          // list -> list or non-list -> non-list: no change.
          block.indent;

        Transforms.setNodes(editor, {type: targetType, indent}, {at: path});
      }
    });
  };

  editor.indent = (options) => Editor.withoutNormalizing(editor, () => {
    for (const [block, path] of blocks(editor, options)) {
      const indent = block.indent || 0;
      if (indent < MaxIndent) {
        Transforms.setNodes(editor, {indent: indent + 1}, {at: path});
      }
    }
  });

  editor.unindent = (options) => Editor.withoutNormalizing(editor, () => {
    for (const [block, path] of blocks(editor, options)) {
      const indent = block.indent || 0;
      if (indent > getMinIndent(block)) {
        Transforms.setNodes(editor, {indent: indent - 1}, {at: path});
      }
    }
  });

  editor.wrapLink = (target, options = {}) => {
    const {at = editor.selection} = options;
    if (!at) {
      return;
    }

    if (Range.isRange(at) && Range.isCollapsed(at)) {
      // Empty range: update existing selected link.
      Transforms.setNodes(editor, {target}, {at, match: isLink});
    } else {
      // The range potentially spans multiple characters - wrap in a link.
      Editor.withoutNormalizing(editor, () => {
        // Links cannot be nested.
        Transforms.unwrapNodes(editor, {at, split: true, match: isLink});

        const link: Element = {type: 'link', target, children: []};
        Transforms.wrapNodes(editor, link, {at, mode: 'lowest', split: true});
      });
    }
  };

  editor.removeLink = (options) => {
    const {selection} = editor;
    Transforms.unwrapNodes(editor, {
      ...options,
      split: selection !== null && !Range.isCollapsed(selection),
      match: isLink,
    });
  };

  return editor as CondictEditor;
};

const createEditor = (singleLine: boolean): CondictEditor =>
  withCondict(
    withReact(
      withHistory(createSlateEditor())
    ),
    {singleLine}
  );

export default createEditor;

export const useCondictEditor = (): CondictEditor =>
  useSlate() as CondictEditor;
