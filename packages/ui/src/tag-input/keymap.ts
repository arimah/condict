import {KeyboardEvent} from 'react';

import {Shortcut, ShortcutMap} from '../shortcut';

import {normalizeTag} from './utils';
import {Messages} from './types';

export type KeyCommand = {
  key: Shortcut | null;
  exec: (event: KeyboardEvent, args: KeyCommandArgs) => void;
};

export interface KeyCommandArgs {
  readonly tags: string[];
  readonly index: number;
  readonly input: HTMLInputElement;
  readonly messages: Messages;

  setTags(value: string[]): void;
  setIndex(index: number, focus?: number): void;
  announce(message: string): void;
}

const isEmptySelectionAtStart = (input: HTMLInputElement) =>
  input.selectionStart === 0 &&
  input.selectionEnd === 0;

const isEmptySelectionAtEnd = (input: HTMLInputElement) =>
  input.selectionStart === input.value.length &&
  input.selectionEnd === input.value.length;

const KeyboardMap = new ShortcutMap<KeyCommand>(
  [
    {
      key: Shortcut.parse(['Enter', 'Shift+Enter', 'Primary+Enter']),
      exec(e, args) {
        if (args.index === -1) {
          e.preventDefault();
          addCurrentInput(args);
        }
      },
    },
    {
      key: Shortcut.parse(['Backspace', 'Shift+Backspace', 'Primary+Backspace']),
      exec(e, args) {
        if (args.index === -1) {
          // If you press backspace in an empty text box, the last tag becomes
          // editable inside the textbox, with the cursor placed at the end.
          // In all other cases, the key press becomes a normal edit command.
          if (args.input.value === '' && args.tags.length > 0) {
            e.preventDefault();
            editTag(args, args.tags.length - 1);
          }
        } else {
          e.preventDefault();
          args.setIndex(args.index - 1);
          removeCurrentTag(args);
        }
      },
    },
    {
      key: Shortcut.parse('F2'),
      exec(e, args) {
        e.preventDefault();
        if (args.index !== -1) {
          editTag(args, args.index);
        }
      },
    },
    {
      key: Shortcut.parse(['Delete', 'Shift+Delete', 'Primary+Delete']),
      exec(e, args) {
        if (args.index !== -1) {
          e.preventDefault();
          const isLast = args.index === args.tags.length - 1;
          args.setIndex(
            // Retain the current index, unless we're deleting the last tag.
            isLast ? -1 : args.index,
            // Focus the *next* tag, as the current will be deleted, or the
            // input if we're on the last tag.
            isLast ? -1 : args.index + 1
          );
          removeCurrentTag(args);
        }
      },
    },
    {
      key: Shortcut.parse('ArrowLeft ArrowUp'),
      exec(e, args) {
        if (args.index === -1) {
          // If we're inside the input, only move to the previous (last) tag if
          // we are at the start of the entered text and the selection is
          // collapsed.
          if (isEmptySelectionAtStart(args.input)) {
            e.preventDefault();
            args.setIndex(args.tags.length - 1);
          }
        } else {
          e.preventDefault();
          // if args.index === 0, we return to -1 = the input
          args.setIndex(args.index - 1);
        }
      },
    },
    {
      key: Shortcut.parse('ArrowRight ArrowDown'),
      exec(e, args) {
        if (args.index === -1) {
          // If we're inside the input, only move to the next (first) tag if
          // we are at the end of the entered text and the selection is
          // collapsed.
          if (isEmptySelectionAtEnd(args.input)) {
            e.preventDefault();
            if (args.tags.length > 0) {
              args.setIndex(0);
            }
          }
        } else {
          e.preventDefault();
          args.setIndex(
            args.index === args.tags.length - 1
              ? -1
              : args.index + 1
          );
        }
      },
    },
    {
      key: Shortcut.parse('Home'),
      exec(e, args) {
        if (args.tags.length > 0 && isEmptySelectionAtStart(args.input)) {
          e.preventDefault();
          args.setIndex(0);
        }
      },
    },
    {
      key: Shortcut.parse('End'),
      exec(e, args) {
        if (args.index === -1) {
          if (args.tags.length > 0 && isEmptySelectionAtEnd(args.input)) {
            e.preventDefault();
            args.setIndex(args.tags.length - 1);
          }
        } else {
          e.preventDefault();
          const lastIndex = args.tags.length - 1;
          // If we're already at the last tag, focus the input instead.
          args.setIndex(args.index === lastIndex ? -1 : lastIndex);
        }
      },
    },
  ],
  cmd => cmd.key
);

export default KeyboardMap;

const addCurrentInput = (args: KeyCommandArgs) => {
  const newTag = normalizeTag(args.input.value);

  if (newTag && !args.tags.includes(newTag)) {
    args.setTags([...args.tags, newTag]);
    args.announce(args.messages.tagAdded(newTag));
  } else {
    args.announce(args.messages.noNewTags());
  }

  args.input.value = '';
};

const removeCurrentTag = (args: KeyCommandArgs) => {
  const tag = args.tags[args.index];
  args.setTags(args.tags.filter((_, i) => i !== args.index));
  args.announce(args.messages.tagRemoved(tag));
};

const editTag = (args: KeyCommandArgs, index: number) => {
  const editedTag = args.tags[index];
  let newTag = normalizeTag(args.input.value);

  let nextTags = args.tags;

  if (newTag && !args.tags.includes(newTag)) {
    nextTags = [...args.tags, newTag];
  } else {
    newTag = '';
  }

  nextTags = nextTags.filter(t => t !== editedTag);
  args.input.value = editedTag;
  args.input.selectionStart = editedTag.length;
  args.input.selectionEnd = editedTag.length;

  args.setTags(nextTags);
  args.setIndex(-1);
  args.announce(args.messages.editingTag(editedTag, newTag));
};
