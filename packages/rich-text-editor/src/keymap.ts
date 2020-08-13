import {Editor, Transforms, Element, Range} from 'slate';

import {Shortcut} from '@condict/ui';

import {blocks} from './node-utils';
import {InlineShortcuts, BlockShortcuts, LinkShortcuts} from './shortcuts';
import {MarkType, CondictEditor, isListType, isHeadingType} from './types';

export type KeyCommand = {
  readonly shortcut: Shortcut | null;
  readonly exec: (editor: CondictEditor, openLinkDialog: () => void) => void;
};

export type KeyboardMapConfig = {
  singleLine: boolean;
  allowLinks: boolean;
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
    exec: editor => toggleMark(editor, 'bold'),
  },
  {
    shortcut: shortcuts.italic,
    exec: editor => toggleMark(editor, 'italic'),
  },
  {
    shortcut: shortcuts.underline,
    exec: editor => toggleMark(editor, 'underline'),
  },
  {
    shortcut: shortcuts.strikethrough,
    exec: editor => toggleMark(editor, 'strikethrough'),
  },
  {
    shortcut: shortcuts.subscript,
    exec: editor => {
      toggleMark(editor, 'subscript');
      editor.removeMark('superscript');
    },
  },
  {
    shortcut: shortcuts.superscript,
    exec: editor => {
      toggleMark(editor, 'superscript');
      editor.removeMark('subscript');
    },
  },
];

export const getSingleLineCommands = (): KeyCommand[] => [
  {
    shortcut: Shortcut.parse(['Enter', 'Shift+Enter', 'Ctrl+Enter']),
    exec: () => { /* do nothing */ },
  },
];

export const getBlockCommands = (shortcuts: BlockShortcuts): KeyCommand[] => [
  {
    shortcut: Shortcut.parse('Enter'),
    exec: editor => Editor.withoutNormalizing(editor, () => {
      const {selection} = editor;
      if (selection && Range.isCollapsed(selection)) {
        const [[block, blockPath]] = blocks(editor);
        const atEnd = Editor.isEnd(editor, selection.focus, blockPath);
        // When you press Enter at the end of a heading block, the block
        // type is reset to paragraph.
        if (isHeadingType(block.type) && atEnd) {
          editor.insertBreak();
          editor.formatBlock('paragraph');
          return;
        }
        // When you press Enter in an empty list item, the block is reset
        // to a paragraph. Indentation is kept.
        const atStart = Editor.isStart(editor, selection.focus, blockPath);
        if (isListType(block.type) && atEnd && atStart) {
          editor.formatBlock('paragraph');
          return;
        }
      }

      editor.insertBreak();
    }),
  },
  {
    shortcut: Shortcut.parse('Shift+Enter'),
    exec: editor => {
      editor.insertText('\n');
    },
  },
  {
    shortcut: Shortcut.parse('Ctrl+Enter'),
    exec: editor => Editor.withoutNormalizing(editor, () => {
      // Ctrl+Enter inserts a new paragraph at the current indentation.
      // Makes it easier to add paragraphs to lists.
      editor.insertBreak();
      // NB: editor.formatBlock removes indentation when going from list
      // to non-list. That's exactly what we *don't* want here!
      Transforms.setNodes(editor, {type: 'paragraph'}, {
        match: Element.isElement,
      });
    }),
  },
  {
    shortcut: shortcuts.heading1,
    exec: editor => editor.formatBlock('heading1'),
  },
  {
    shortcut: shortcuts.heading2,
    exec: editor => editor.formatBlock('heading2'),
  },
  {
    shortcut: shortcuts.bulletList,
    exec: editor => editor.formatBlock('bulletListItem'),
  },
  {
    shortcut: shortcuts.numberList,
    exec: editor => editor.formatBlock('numberListItem'),
  },
  {
    shortcut: shortcuts.indent,
    exec: editor => editor.indent(),
  },
  {
    shortcut: shortcuts.unindent,
    exec: editor => editor.unindent(),
  },
];

export const getLinkCommands = (shortcuts: LinkShortcuts): KeyCommand[] => [
  {
    shortcut: shortcuts.addLink,
    exec: (_editor, openLinkDialog) => {
      openLinkDialog();
    },
  },
  {
    shortcut: shortcuts.removeLink,
    exec: editor => editor.removeLink(),
  },
];
