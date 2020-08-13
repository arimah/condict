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
  editor: ReactEditor & HistoryEditor,
  options: {
    singleLine?: boolean;
  } = {}
): CondictEditor => {
  const {singleLine = false} = options;

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

  editor.formatBlock = (format: BlockType) => {
    const targetType = isBlockActive(editor, format)
      ? 'paragraph'
      : format;
    const isList = isListType(targetType);

    Editor.withoutNormalizing(editor, () => {
      for (const [block, path] of blocks(editor)) {
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

  editor.indent = () => Editor.withoutNormalizing(editor, () => {
    for (const [block, path] of blocks(editor)) {
      const indent = block.indent || 0;
      if (indent < MaxIndent) {
        Transforms.setNodes(editor, {indent: indent + 1}, {at: path});
      }
    }
  });

  editor.unindent = () => Editor.withoutNormalizing(editor, () => {
    for (const [block, path] of blocks(editor)) {
      const indent = block.indent || 0;
      if (indent > getMinIndent(block)) {
        Transforms.setNodes(editor, {indent: indent - 1}, {at: path});
      }
    }
  });

  editor.wrapLink = (target: LinkTarget, at: Range | null = null) => {
    const selection = at || editor.selection;
    if (!selection) {
      return;
    }

    if (Range.isCollapsed(selection)) {
      // Empty selection range: update existing selected link.
      Transforms.setNodes(editor, {target}, {match: isLink});
    } else {
      // The selection spans multiple characters - wrap in a link.
      Editor.withoutNormalizing(editor, () => {
        // Links cannot be nested.
        Transforms.unwrapNodes(editor, {split: true, match: isLink});

        const link: Element = {type: 'link', target, children: []};
        Transforms.wrapNodes(editor, link, {mode: 'lowest', split: true});
      });
    }
  };

  editor.removeLink = () => {
    const {selection} = editor;
    Transforms.unwrapNodes(editor, {
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
