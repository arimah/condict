import {KeyboardEvent} from 'react';
import {Editor, Transforms, Node, Element, Text, Range} from 'slate';
import {HistoryEditor} from 'slate-history';

import {Shortcut} from '@condict/ui';

import {blocks, isBlock} from './node-utils';
import {
  InlineShortcuts,
  BlockShortcuts,
  LinkShortcuts,
  HelperShortcuts,
} from './shortcuts';
import {MarkType, CondictEditor, isListType, isHeadingType} from './types';

// Note: We don't have to worry about editor.blurSelection here, as you can't
// trigger keyboard shortcuts without focusing the editor.

export type KeyCommand = {
  readonly shortcut: Shortcut | null;
  readonly exec: (
    event: KeyboardEvent<HTMLDivElement>,
    args: {
      editor: CondictEditor;
      openLinkDialog: () => void;
      openIpaDialog: () => void;
      focusPopup: () => void;
    }
  ) => void;
};

export type KeyboardMapConfig = {
  singleLine: boolean;
  allowLinks: boolean;
};

const handle = (event: KeyboardEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

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
    shortcut: shortcuts.bold,
    exec: (e, {editor}) => {
      handle(e);
      toggleMark(editor, 'bold');
    },
  },
  {
    shortcut: shortcuts.italic,
    exec: (e, {editor}) => {
      handle(e);
      toggleMark(editor, 'italic');
    },
  },
  {
    shortcut: shortcuts.underline,
    exec: (e, {editor}) => {
      handle(e);
      toggleMark(editor, 'underline');
    },
  },
  {
    shortcut: shortcuts.strikethrough,
    exec: (e, {editor}) => {
      handle(e);
      toggleMark(editor, 'strikethrough');
    },
  },
  {
    shortcut: shortcuts.subscript,
    exec: (e, {editor}) => {
      handle(e);
      toggleMark(editor, 'subscript');
      editor.removeMark('superscript');
    },
  },
  {
    shortcut: shortcuts.superscript,
    exec: (e, {editor}) => {
      handle(e);
      toggleMark(editor, 'superscript');
      editor.removeMark('subscript');
    },
  },
];

export const getSingleLineCommands = (): KeyCommand[] => [
  {
    shortcut: Shortcut.parse(['Enter', 'Shift+Enter', 'Ctrl+Enter']),
    exec: e => handle(e), // do nothing
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
          handle(e);
          editor.insertBreak();
          editor.formatBlock('paragraph');
          return;
        }
        // When you press Enter in an empty list item, the block is reset
        // to a paragraph. Indentation is kept.
        const atStart = Editor.isStart(editor, selection.focus, blockPath);
        if (isListType(block.type) && atEnd && atStart) {
          handle(e);
          editor.formatBlock('paragraph');
          return;
        }
      }
    }),
  },
  {
    shortcut: Shortcut.parse('Shift+Enter'),
    exec: (e, {editor}) => {
      handle(e);
      editor.insertText('\n');
    },
  },
  {
    shortcut: Shortcut.parse('Ctrl+Enter'),
    exec: (e, {editor}) => {
      handle(e);
      Editor.withoutNormalizing(editor, () => {
        // Ctrl+Enter inserts a new paragraph at the current indentation.
        // Makes it easier to add paragraphs to lists.
        editor.insertBreak();
        // NB: editor.formatBlock removes indentation when going from list
        // to non-list. That's exactly what we *don't* want here!
        Transforms.setNodes(editor, {type: 'paragraph'}, {
          // eslint-disable-next-line @typescript-eslint/unbound-method
          match: Element.isElement,
        });
      });
    },
  },
  {
    shortcut: shortcuts.heading1,
    exec: (e, {editor}) => {
      handle(e);
      editor.formatBlock('heading1');
    },
  },
  {
    shortcut: shortcuts.heading2,
    exec: (e, {editor}) => {
      handle(e);
      editor.formatBlock('heading2');
    },
  },
  {
    shortcut: shortcuts.bulletList,
    exec: (e, {editor}) => {
      handle(e);
      editor.formatBlock('bulletListItem');
    },
  },
  {
    shortcut: shortcuts.numberList,
    exec: (e, {editor}) => {
      handle(e);
      editor.formatBlock('numberListItem');
    },
  },
  {
    shortcut: shortcuts.indent,
    exec: (e, {editor}) => {
      handle(e);
      editor.indent();
    },
  },
  {
    shortcut: shortcuts.unindent,
    exec: (e, {editor}) => {
      handle(e);
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
        const [block, blockPath] = Editor.above<Element>(editor, {
          at: focus.path,
          match: n => isBlock(n, editor),
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
          handle(e);

          // HistoryEditor.withoutMerging prevents merging into the *previous*
          // history state. The ' ' should be its own history state, so you
          // can undo back to `* `, `1. ` or whatever you typed. The deletion
          // and the block formatting are merged into one action, so that you
          // *can't* get back to an empty block.

          HistoryEditor.withoutMerging(editor, () => {
            editor.insertText(' ');
          });

          HistoryEditor.withoutMerging(editor, () => {
            Transforms.delete(editor, {
              distance: focus.offset + 1, // +1 for newly inserted ' '
              reverse: true,
              unit: 'character',
            });
          });
          const listType = BulletListStart.test(text.text)
            ? 'bulletListItem'
            : 'numberListItem';
          editor.formatBlock(listType, {at: blockPath});
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
          handle(e);
          editor.formatBlock('paragraph');
          return;
        }
      }
    },
  },
];

export const getLinkCommands = (shortcuts: LinkShortcuts): KeyCommand[] => [
  {
    shortcut: shortcuts.addLink,
    exec: (e, {openLinkDialog}) => {
      handle(e);
      openLinkDialog();
    },
  },
  {
    shortcut: shortcuts.removeLink,
    exec: (e, {editor}) => {
      handle(e);
      editor.removeLink();
    },
  },
];

export const getHelperCommands = (shortcuts: HelperShortcuts): KeyCommand[] => [
  {
    shortcut: shortcuts.insertIpa,
    exec: (e, {openIpaDialog}) => {
      handle(e);
      openIpaDialog();
    },
  },
  {
    shortcut: shortcuts.focusPopup,
    exec: (e, {focusPopup}) => {
      handle(e);
      focusPopup();
    },
  },
];
