import {BaseEditor, Editor, Operation, Path} from 'slate';

import {CondictEditor} from '../types';

import {HistoryEditor, IsolatedState} from './history-editor';
import {HistoryState} from './types';

// Set for editors where the history is being manipulated, in a call to
// `undo()` or `redo()`.
const Manipulating = new WeakMap<HistoryEditor, boolean | undefined>();

/**
 * Last operation time for isolated states. Indicates that the state can never
 * be merged into by subsequent operations.
 */
const IsolatedStateTime = -1;

const MaxStack = 200;

/**
 * The maximum time the user can pause before we create a new history state.
 */
const MaxPause = 1000;

export const withHistory = <E extends BaseEditor>(
  editor: E
): HistoryEditor & E => {
  const e = editor as HistoryEditor & E;
  const {apply} = e;

  e.history = {
    undos: [],
    redos: [],
  };

  e.undo = () => {
    const {history} = e;
    const {undos} = history;

    if (undos.length > 0) {
      const state = undos[undos.length - 1];

      Manipulating.set(e, true);
      Editor.withoutNormalizing(e as unknown as CondictEditor, () => {
        for (let i = state.operations.length - 1; i >= 0; i--) {
          const op = Operation.inverse(state.operations[i]);
          e.apply(op);
        }
      });
      Manipulating.set(e, false);

      history.undos.pop();
      history.redos.push(state);
    }
  };

  e.redo = () => {
    const {history} = e;
    const {redos} = history;

    if (history.redos.length > 0) {
      const state = redos[redos.length - 1];

      Manipulating.set(e, true);
      Editor.withoutNormalizing(e as unknown as CondictEditor, () => {
        for (let i = 0; i < state.operations.length; i++) {
          const op = state.operations[i];
          e.apply(op);
        }
      });
      Manipulating.set(e, false);

      history.redos.pop();
      history.undos.push(state);
    }
  };

  e.apply = op => {
    if (!Manipulating.get(e)) {
      // NB: We need to save selection changes so operations after the
      // selection change can apply to the correct location.
      const {history} = e;

      let state: HistoryState | null = null;
      if (shouldSave(op)) {
        state = getCurrentState(e, op);

        const {operations} = state;
        const lastOp = operations[operations.length - 1];

        if (shouldReplace(op, lastOp)) {
          operations.pop();
        }
        operations.push(op);

        if (shouldClearRedoStack(op)) {
          history.redos = [];
        }

        while (history.undos.length > MaxStack) {
          history.undos.pop();
        }
      }
    }

    apply(op);
  };

  return e;
};

const getCurrentState = (e: HistoryEditor, op: Operation): HistoryState => {
  const {history} = e;
  const {undos} = history;

  if (HistoryEditor.isIsolated(e)) {
    let state = IsolatedState.get(e);

    if (!state) {
      state = createState(IsolatedStateTime);
      IsolatedState.set(e, state);
      undos.push(state);
    }

    return state;
  } else {
    let state: HistoryState | null = null;
    const now = Date.now();

    if (undos.length > 0) {
      const lastState = undos[undos.length - 1];
      if (shouldReuse(e, lastState, now, op)) {
        state = lastState;
        state.lastOperationTime = now;
      }
    }

    if (!state) {
      state = createState(now);
      undos.push(state);
    }

    return state;
  }
};

const createState = (now: number): HistoryState => ({
  operations: [],
  lastOperationTime: now,
});

const shouldSave = (op: Operation): boolean => {
  switch (op.type) {
    case 'set_selection':
      // Do not save partial selection changes, such as what might happen
      // when the editor is focused/blurred.
      return op.properties != null && op.newProperties != null;
    default:
      return true;
  }
};

const shouldReplace = (op: Operation, prev: Operation | undefined): boolean => {
  if (prev && op.type === 'set_selection' && prev.type === 'set_selection') {
    return true;
  }
  return false;
};

const shouldReuse = (
  editor: HistoryEditor,
  state: HistoryState,
  now: number,
  op: Operation
): boolean => {
  if (state.lastOperationTime === IsolatedStateTime) {
    return false;
  }

  // Merge all operations that happen in the same event tick into the same
  // history state.
  if (editor.operations.length > 0) {
    return true;
  }

  // Selections can be merged without consequence.
  if (op.type === 'set_selection') {
    return true;
  }

  const timeSinceOperation = now - state.lastOperationTime;
  if (timeSinceOperation > MaxPause) {
    return false;
  }

  const prev = state.operations[state.operations.length - 1];
  if (
    prev &&
    op.type === 'insert_text' &&
    prev.type === 'insert_text' &&
    op.offset === prev.offset + prev.text.length &&
    Path.equals(op.path, prev.path)
  ) {
    // Insertion of text after last insertion.
    return true;
  }

  if (
    prev &&
    op.type === 'remove_text' &&
    prev.type === 'remove_text' &&
    op.offset + op.text.length === prev.offset &&
    Path.equals(op.path, prev.path)
  ) {
    // Deletion of text after last deletion.
    return true;
  }

  return false;
};

const shouldClearRedoStack = (op: Operation): boolean => {
  switch (op.type) {
    case 'set_selection':
      return false;
    default:
      return true;
  }
};
