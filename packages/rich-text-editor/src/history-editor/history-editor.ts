import {BaseEditor} from 'slate';

import {History, HistoryState} from './types';

export const Isolate = new WeakMap<HistoryEditor, boolean | undefined>();
export const IsolatedState = new WeakMap<HistoryEditor, HistoryState>();

export interface HistoryEditor extends BaseEditor {
  history: History;
  undo: () => void;
  redo: () => void;
}

export const HistoryEditor = {
  isIsolated(editor: HistoryEditor): boolean | undefined {
    return Isolate.get(editor);
  },

  undo(editor: HistoryEditor): void {
    editor.undo();
  },

  redo(editor: HistoryEditor): void {
    editor.redo();
  },

  /**
   * Applies a series of changes inside a callback as an isolated history state.
   * The history state will not be merged into any previous *or* subsequent
   * state, and can be undone and redone as a single unit.
   * @param editor The editor.
   * @param f A function that applies changes to the editor.
   */
  isolate(editor: HistoryEditor, f: () => void): void {
    const prev = HistoryEditor.isIsolated(editor);
    Isolate.set(editor, true);
    f();
    Isolate.set(editor, prev);

    // If we're done isolating the history, delete the old isolated state.
    if (!prev) {
      IsolatedState.delete(editor);
    }
  },
};
