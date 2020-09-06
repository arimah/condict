import produce, {Draft} from 'immer';

export interface HistoryStack<T> {
  readonly value: T;
  readonly undo: readonly T[];
  readonly redo: readonly T[];
}

export const HistoryStack = {
  create<T>(value: T): HistoryStack<T> {
    return {value, undo: [], redo: []};
  },

  canUndo<T>(history: HistoryStack<T>): boolean {
    return history.undo.length > 0;
  },

  canRedo<T>(history: HistoryStack<T>): boolean {
    return history.redo.length > 0;
  },

  set<T>(history: HistoryStack<T>, value: T): HistoryStack<T> {
    return produce(history, history => {
      history.value = value as Draft<T>;
    });
  },

  push<T>(history: HistoryStack<T>, value: T): HistoryStack<T> {
    return produce(history, history => {
      history.undo.push(history.value);
      history.redo = [];
      history.value = value as Draft<T>;
    });
  },

  undo<T>(history: HistoryStack<T>): HistoryStack<T> {
    if (history.undo.length === 0) {
      return history;
    }
    return produce(history, history => {
      history.redo.push(history.value);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      history.value = history.undo.pop()!;
    });
  },

  redo<T>(history: HistoryStack<T>): HistoryStack<T> {
    if (history.redo.length === 0) {
      return history;
    }
    return produce(history, history => {
      history.undo.push(history.value);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      history.value = history.redo.pop()!;
    });
  },
};
