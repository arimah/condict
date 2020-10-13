import {Shortcut, ShortcutMap} from '../shortcut';
import {Descendants} from '../descendants';

import TagInput from './main';

export type KeyCommand = {
  key: Shortcut | null;
  exec: (tagInput: TagInput) => boolean;
};

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
      exec(tagInput: TagInput) {
        if (tagInput.state.selected.tag === null) {
          tagInput.commitTags(false);
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse(['Backspace', 'Shift+Backspace', 'Primary+Backspace']),
      exec(tagInput: TagInput) {
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
        if (!input) {
          return false;
        }

        if (tag === null) {
          const {tags} = tagInput.props;
          // If you press backspace in an empty text box, the last tag becomes
          // editable inside the textbox, with the cursor placed at the end.
          // In all other cases, the key press becomes a normal edit command.
          if (input.value === '' && tags.length > 0) {
            tagInput.editTag(tags[tags.length - 1]);
            return true;
          }
        } else {
          // Delete the selected tag
          tagInput.deleteTag(tag, (items, current) =>
            tag === tagInput.props.tags[0]
              ? Descendants.nextWrapping(items, current)
              : Descendants.prevWrapping(items, current)
          );
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('F2'),
      exec(tagInput: TagInput) {
        const {selected: {tag}} = tagInput.state;
        if (tag !== null) {
          tagInput.editTag(tag);
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse(['Delete', 'Shift+Delete', 'Primary+Delete']),
      exec(tagInput: TagInput) {
        const {selected: {tag}} = tagInput.state;
        if (tag !== null) {
          // eslint-disable-next-line @typescript-eslint/unbound-method
          tagInput.deleteTag(tag, Descendants.nextWrapping);
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('ArrowLeft ArrowUp'),
      exec(tagInput: TagInput) {
        // The up and left arrows only move the selection into the last tag
        // if the text box has an empty selection at the start. Otherwise it
        // will be treated as a normal edit command.
        const {selected} = tagInput.state;
        const input = tagInput.input.current;
        if (selected.tag !== null || input && isEmptySelectionAtStart(input)) {
          Descendants.prevWrapping(tagInput.items, selected).elem.focus();
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('ArrowRight ArrowDown'),
      exec(tagInput: TagInput) {
        // The down and right arrows only move selection into the first tag
        // if the text box has an empty selection at the end. Otherwise it
        // will be treated as a normal edit command.
        const {selected} = tagInput.state;
        const input = tagInput.input.current;
        if (selected.tag !== null || input && isEmptySelectionAtEnd(input)) {
          Descendants.nextWrapping(tagInput.items, selected).elem.focus();
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('Home'),
      exec(tagInput: TagInput) {
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
        if (tag !== null || input && isEmptySelectionAtStart(input)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Descendants.first(tagInput.items)!.elem.focus();
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('End'),
      exec(tagInput: TagInput) {
        const {tags} = tagInput.props;
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
        if (tag !== null || input && isEmptySelectionAtEnd(input)) {
          const lastTag = tags[tags.length - 1];
          const nextSelected = tag === lastTag
            ? Descendants.last(tagInput.items)
            : Descendants.first(tagInput.items, r => r.tag === lastTag);
          if (nextSelected) {
            nextSelected.elem.focus();
          }
          return true;
        }
        return false;
      },
    },
  ],
  cmd => cmd.key
);

export default KeyboardMap;
