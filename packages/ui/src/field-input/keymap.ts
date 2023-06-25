import {Dispatch, KeyboardEvent} from 'react';

import {Shortcut, ShortcutMap} from '../shortcut';
import {WritingDirection} from '../writing-direction';

import {State, Message} from './types';

export interface KeyCommand {
  key: Shortcut | null;
  exec: <T>(e: KeyboardEvent, args: KeyCommandArgs<T>) => void;
}

export interface KeyCommandArgs<T> {
  readonly state: State<T>;
  readonly main: HTMLDivElement;
  readonly input: HTMLInputElement;
  readonly dropdown: HTMLDivElement;
  readonly suggestionList: HTMLUListElement;
  readonly suggestionCount: number;
  readonly dispatch: Dispatch<Message<T>>;
  readonly select: (index: number) => void;
}

const isEmptySelectionAtStart = (input: HTMLInputElement) =>
  input.selectionStart === 0 &&
  input.selectionEnd === 0;

const isEmptySelectionAtEnd = (input: HTMLInputElement) =>
  input.selectionStart === input.value.length &&
  input.selectionEnd === input.value.length;

const getKeyboardMap = (dir: WritingDirection): ShortcutMap<KeyCommand> =>
  new ShortcutMap<KeyCommand>(
    [
      {
        key: Shortcut.parse('ArrowUp'),
        exec(e, args) {
          const {state} = args;
          if (args.suggestionCount === 0) {
            return;
          }

          let newIndex = state.index;
          if (state.index === -1) {
            if (isEmptySelectionAtStart(args.input)) {
              e.preventDefault();
              newIndex = args.suggestionCount - 1;
            }
          } else {
            e.preventDefault();
            newIndex = state.index - 1;
          }

          if (newIndex !== state.index) {
            args.dispatch({type: 'selectSuggestion', index: newIndex});
          }
          args.input.focus();
        },
      },
      {
        key: Shortcut.parse('ArrowDown'),
        exec(e, args) {
          const {state} = args;
          if (args.suggestionCount === 0) {
            return;
          }

          let newIndex = state.index;
          if (state.index === -1) {
            if (isEmptySelectionAtEnd(args.input)) {
              e.preventDefault();
              newIndex = 0;
            }
          } else {
            // index range: [-1, suggestionCount)
            e.preventDefault();
            newIndex = (state.index + 2) % (args.suggestionCount + 1) - 1;
          }

          if (newIndex !== state.index) {
            args.dispatch({type: 'selectSuggestion', index: newIndex});
          }
          args.input.focus();
        },
      },
      {
        key: Shortcut.parse(dir === 'ltr' ? 'ArrowLeft' : 'ArrowRight'),
        exec(e, args) {
          const {state} = args;
          if (state.focus === 'input') {
            if (state.index === -1 && isEmptySelectionAtStart(args.input)) {
              getLastValueButton(args)?.focus();
            }
          } else if (state.focus === 'value') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const current = getCurrentValueButton()!;
            const prev = getPrevValueButton(args, current);
            if (prev) {
              prev.focus();
            } else {
              args.input.focus();
            }
          }
        },
      },
      {
        key: Shortcut.parse(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft'),
        exec(e, args) {
          const {state} = args;
          if (state.focus === 'input') {
            if (state.index === -1 && isEmptySelectionAtEnd(args.input)) {
              getFirstValueButton(args)?.focus();
            }
          } else if (state.focus === 'value') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const current = getCurrentValueButton()!;
            const next = getNextValueButton(args, current);
            if (next) {
              next.focus();
            } else {
              args.input.focus();
            }
          }
        },
      },
      {
        key: Shortcut.parse(['Space', 'Shift+Space']),
        exec(e, args) {
          const {state} = args;
          if (state.focus !== 'input' || state.index === -1) {
            return;
          }

          e.preventDefault();
          args.select(state.index);
        },
      },
      {
        key: Shortcut.parse(['Enter', 'Shift+Enter']),
        exec(e, args) {
          const {state} = args;

          if (state.focus !== 'input') {
            // Allow Enter to activate buttons
            return;
          }

          e.preventDefault();
          if (args.suggestionCount === 0) {
            return;
          }

          // If selection is on the input, select the first suggestion only if
          // there is a search query.
          // Empty input = I haven't selected anything yet
          if (state.index === -1 && /^\s*$/.test(args.input.value)) {
            return;
          }

          const index = Math.max(state.index, 0);
          args.select(index);
          args.dispatch({type: 'input', input: ''});

          if (state.index !== -1) {
            args.dispatch({type: 'selectSuggestion', index: -1});
            args.input.focus();
          }
        },
      },
      {
        key: Shortcut.parse('Escape'),
        exec(e, args) {
          const {state} = args;
          e.preventDefault();
          if (state.focus === 'input' && state.index === -1) {
            args.dispatch({type: 'input', input: ''});
          } else {
            args.dispatch({type: 'selectSuggestion', index: -1});
            args.input.focus();
          }
        },
      },
      {
        key: Shortcut.parse('Home'),
        exec(e, args) {
          const {state} = args;
          if (state.focus === 'value') {
            e.preventDefault();
            getFirstValueButton(args)?.focus();
          } else if (state.index !== -1) {
            e.preventDefault();
            if (state.index === 0) {
              args.dispatch({type: 'selectSuggestion', index: -1});
              args.input.focus();
            } else {
              args.dispatch({type: 'selectSuggestion', index: 0});
            }
          }
        },
      },
      {
        key: Shortcut.parse('End'),
        exec(e, args) {
          const {state} = args;
          if (state.focus === 'value') {
            e.preventDefault();

            const last = getLastValueButton(args);
            if (last && last !== document.activeElement) {
              last.focus();
            } else {
              args.input.focus();
            }
          } else if (state.index !== -1) {
            e.preventDefault();
            args.dispatch({
              type: 'selectSuggestion',
              index: args.suggestionCount - 1,
            });
          }
        },
      },
      {
        key: Shortcut.parse(['Backspace', 'Shift+Backspace', 'Primary+Backspace']),
        exec(e, args) {
          const {state} = args;
          if (state.focus === 'input') {
            if (state.index === -1 && args.input.value === '') {
              e.preventDefault();
              getLastValueButton(args)?.focus();
            }
          } else if (state.focus === 'value') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const current = getCurrentValueButton()!;
            // Trigger a click to delete the value
            current.click();

            const prev = getPrevValueButton(args, current);
            if (prev) {
              prev.focus();
            } else {
              args.input.focus();
            }
          }
        },
      },
      {
        key: Shortcut.parse(['Delete', 'Shift+Delete', 'Primary+Delete']),
        exec(e, args) {
          const {state} = args;
          if (state.focus === 'value') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const current = getCurrentValueButton()!;
            // Trigger a click to delete the value
            current.click();

            const next = getNextValueButton(args, current);
            if (next) {
              next.focus();
            } else {
              args.input.focus();
            }
          }
        },
      },
    ],
    cmd => cmd.key
  );

export default getKeyboardMap;

// These helper functions are kinda ugly in that they rely on a particular
// DOM structure just because I don't want to capture an array of all value
// buttons. Not ideal, but it works.

const getCurrentValueButton = (): HTMLButtonElement | null => {
  const elem = document.activeElement;
  return isValueButton(elem) ? elem : null;
};

const getFirstValueButton = <T>(
  args: KeyCommandArgs<T>
): HTMLButtonElement | null => {
  const first = args.main.firstElementChild;
  return isValueButton(first) ? first : null;
};

const getPrevValueButton = <T>(
  args: KeyCommandArgs<T>,
  current: Element
): HTMLButtonElement | null => {
  if (current.parentElement !== args.main) {
    // Something has gone wrong
    return null;
  }
  const prev = current.previousElementSibling;
  return isValueButton(prev) ? prev : null;
};

const getNextValueButton = <T>(
  args: KeyCommandArgs<T>,
  current: Element
): HTMLButtonElement | null => {
  if (current.parentElement !== args.main) {
    // Something has gone wrong
    return null;
  }
  const next = current.nextElementSibling;
  return isValueButton(next) ? next : null;
};

const getLastValueButton = <T>(
  args: KeyCommandArgs<T>
): HTMLButtonElement | null => {
  const last = args.input.parentElement?.previousElementSibling;
  return isValueButton(last) ? last : null;
};

const isValueButton = (
  node: ChildNode | null | undefined
): node is HTMLButtonElement =>
  node != null &&
  node.nodeType === Node.ELEMENT_NODE &&
  (node as Element).tagName === 'BUTTON';
