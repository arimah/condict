import {KeyboardEvent} from 'react';
import {Editor, Transforms, Node, Element, Text, Range} from 'slate';

import {Shortcut, Shortcuts} from '@condict/ui';

import {HistoryEditor} from './history-editor';
import {MaxIndent, blocks, isBlock} from './node-utils';
import {
  InlineShortcuts,
  BlockShortcuts,
  LinkShortcuts,
  HelperShortcuts,
} from './shortcuts';
import {
  MarkType,
  CondictEditor,
  BlockElement,
  isListType,
  isHeadingType,
} from './types';

// Note: We don't have to worry about editor.blurSelection here, as you can't
// trigger keyboard shortcuts without focusing the editor.

export interface KeyCommand<A = {}> {
  readonly shortcut: Shortcut | null;
  readonly exec: (
    event: KeyboardEvent<HTMLDivElement>,
    args: A & {
      editor: CondictEditor;
    }
  ) => void;
}

export interface KeyboardMapConfig {
  singleLine: boolean;
  allowLinks: boolean;
}

const toggleMark = (editor: CondictEditor, key: MarkType) => {
  const marks = Editor.marks(editor);
  if (marks && marks[key]) {
    editor.removeMark(key);
  } else {
    editor.addMark(key, true);
  }
};

export const getInlineCommands = (shortcuts: InlineShortcuts): KeyCommand[] => [
  {
    shortcut: Shortcuts.undo,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.undo();
    },
  },
  {
    shortcut: Shortcuts.redo,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.redo();
    },
  },
  {
    shortcut: shortcuts.bold,
    exec: (e, {editor}) => {
      e.preventDefault();
      toggleMark(editor, 'bold');
    },
  },
  {
    shortcut: shortcuts.italic,
    exec: (e, {editor}) => {
      e.preventDefault();
      toggleMark(editor, 'italic');
    },
  },
  {
    shortcut: shortcuts.underline,
    exec: (e, {editor}) => {
      e.preventDefault();
      toggleMark(editor, 'underline');
    },
  },
  {
    shortcut: shortcuts.strikethrough,
    exec: (e, {editor}) => {
      e.preventDefault();
      toggleMark(editor, 'strikethrough');
    },
  },
  {
    shortcut: shortcuts.subscript,
    exec: (e, {editor}) => {
      e.preventDefault();
      toggleMark(editor, 'subscript');
      editor.removeMark('superscript');
    },
  },
  {
    shortcut: shortcuts.superscript,
    exec: (e, {editor}) => {
      e.preventDefault();
      toggleMark(editor, 'superscript');
      editor.removeMark('subscript');
    },
  },
];

export const getSingleLineCommands = (): KeyCommand[] => [
  {
    shortcut: Shortcut.parse(['Enter', 'Shift+Enter', 'Ctrl+Enter']),
    exec: e => e.preventDefault(), // do nothing
  },
];

const ListStart = /^(?:[-*+]|\d+[.)])$/;
const BulletListStart = /^[-*+]/;

export const getBlockCommands = (shortcuts: BlockShortcuts): KeyCommand[] => [
  {
    shortcut: Shortcut.parse('Enter'),
    exec: (e, {editor}) => Editor.withoutNormalizing(editor, () => {
      const {selection} = editor;
      if (selection && Range.isCollapsed(selection)) {
        const [[block, blockPath]] = blocks(editor);
        const atEnd = Editor.isEnd(editor, selection.focus, blockPath);
        // When you press Enter at the end of a heading block, the block
        // type is reset to paragraph.
        if (isHeadingType(block.type) && atEnd) {
          e.preventDefault();
          editor.insertBreak();
          editor.formatBlock('paragraph');
          return;
        }
        // When you press Enter in an empty list item, the block is reset
        // to a paragraph. Indentation is kept.
        const atStart = Editor.isStart(editor, selection.focus, blockPath);
        if (isListType(block.type) && atEnd && atStart) {
          e.preventDefault();
          editor.formatBlock('paragraph');
          return;
        }
      }
    }),
  },
  {
    shortcut: Shortcut.parse('Shift+Enter'),
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.insertText('\n');
    },
  },
  {
    shortcut: Shortcut.parse('Ctrl+Enter'),
    exec: (e, {editor}) => {
      e.preventDefault();
      Editor.withoutNormalizing(editor, () => {
        // Ctrl+Enter inserts a new paragraph at the current indentation.
        // Makes it easier to add paragraphs to lists.
        editor.insertBreak();

        // Lists are are displayed one level deeper than they're stored, so when
        // pressing Ctrl+Enter in a list, we need to indent by one level.
        const [[block, blockPath]] = blocks(editor);
        const indent = isListType(block.type)
          ? Math.min((block.indent || 0) + 1, MaxIndent)
          : block.indent;
        Transforms.setNodes(editor, {type: 'paragraph', indent}, {
          at: blockPath,
        });
      });
    },
  },
  {
    shortcut: shortcuts.heading1,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.formatBlock('heading1');
    },
  },
  {
    shortcut: shortcuts.heading2,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.formatBlock('heading2');
    },
  },
  {
    shortcut: shortcuts.bulletList,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.formatBlock('bulletListItem');
    },
  },
  {
    shortcut: shortcuts.numberList,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.formatBlock('numberListItem');
    },
  },
  {
    shortcut: shortcuts.indent,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.indent();
    },
  },
  {
    shortcut: shortcuts.unindent,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.unindent();
    },
  },
  {
    shortcut: Shortcut.parse(['Space', 'Shift+Space']),
    exec: (e, {editor}) => {
      const {selection} = editor;
      if (selection && Range.isCollapsed(selection)) {
        const {focus} = selection;

        // The text node that the cursor is inside of.
        const text = Node.get(editor, focus.path) as Text;

        // The nearest block.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [block, blockPath] = Editor.above(editor, {
          at: focus.path,
          match: (n): n is BlockElement => isBlock(n, editor),
        })!;

        const isFirstAndOnlyText =
          block.children.length === 1 &&
          block.children[0] === text;

        if (
          isFirstAndOnlyText &&
          block.type === 'paragraph' &&
          focus.offset === text.text.length &&
          ListStart.test(text.text)
        ) {
          e.preventDefault();

          HistoryEditor.isolate(editor, () => {
            editor.insertText(' ');
          });

          HistoryEditor.isolate(editor, () => {
            Transforms.delete(editor, {
              distance: focus.offset + 1, // +1 for newly inserted ' '
              reverse: true,
              unit: 'character',
            });

            const listType = BulletListStart.test(text.text)
              ? 'bulletListItem'
              : 'numberListItem';
            editor.formatBlock(listType, {at: blockPath});
          });
          return;
        }
      }
    },
  },
  {
    shortcut: Shortcut.parse(['Backspace', 'Shift+Backspace']),
    exec: (e, {editor}) => {
      const {selection} = editor;
      if (selection && Range.isCollapsed(selection)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [block, blockPath] = Editor.above<Element>(editor, {
          at: selection,
          match: n => isBlock(n, editor),
        })!;
        const atStart = Editor.isStart(editor, selection.focus, blockPath);
        const atEnd = Editor.isEnd(editor, selection.focus, blockPath);
        // Backspace in an empty list item resets it to paragraph.
        if (isListType(block.type) && atStart && atEnd) {
          e.preventDefault();
          editor.formatBlock('paragraph');
          return;
        }
      }
    },
  },
];

export interface LinkArgs {
  openLinkDialog: () => void;
}

export const getLinkCommands = (shortcuts: LinkShortcuts): KeyCommand<LinkArgs>[] => [
  {
    shortcut: shortcuts.addLink,
    exec: (e, {openLinkDialog}) => {
      e.preventDefault();
      openLinkDialog();
    },
  },
  {
    shortcut: shortcuts.removeLink,
    exec: (e, {editor}) => {
      e.preventDefault();
      editor.removeLink();
    },
  },
];

export interface HelperArgs {
  openIpaDialog: () => void;
  focusPopup: () => void;
}

export const getHelperCommands = (shortcuts: HelperShortcuts): KeyCommand<HelperArgs>[] => [
  {
    shortcut: shortcuts.insertIpa,
    exec: (e, {openIpaDialog}) => {
      e.preventDefault();
      openIpaDialog();
    },
  },
  {
    shortcut: shortcuts.focusPopup,
    exec: (e, {focusPopup}) => {
      e.preventDefault();
      focusPopup();
    },
  },
];
