import {
  CommandGroup,
  CommandSpecMap,
  Shortcuts,
  useCommandGroup,
} from '@condict/ui';

export interface HistoryValue<T> {
  current: T;
  readonly undo: T[];
  readonly redo: T[];
}

export const HistoryValue = {
  createOrPush<T>(
    value: T,
    history: HistoryValue<T> | null
  ): HistoryValue<T> {
    if (!history) {
      return {
        current: value,
        undo: [],
        redo: [],
      };
    }
    HistoryValue.push(history, value);
    return history;
  },

  replace<T>(history: HistoryValue<T>, value: T): void {
    history.current = value;
  },

  push<T>(history: HistoryValue<T>, value: T): void {
    history.undo.push(history.current);
    history.current = value;
    history.redo.length = 0;
  },

  undo<T>(history: HistoryValue<T>): boolean {
    if (history.undo.length > 0) {
      history.redo.push(history.current);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      history.current = history.undo.pop()!;
      return true;
    }
    return false;
  },

  redo<T>(history: HistoryValue<T>): boolean {
    if (history.redo.length > 0) {
      history.undo.push(history.current);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      history.current = history.redo.pop()!;
      return true;
    }
    return false;
  },
} as const;

type HistoryAction = 'undo' | 'redo';

const HistoryCommands: CommandSpecMap<HistoryAction> = {
  undo: {
    action: 'undo',
    shortcut: Shortcuts.undo,
  },
  redo: {
    action: 'redo',
    shortcut: Shortcuts.redo,
  },
};

export const useHistoryCommands = <T>(
  history: HistoryValue<T>,
  onChange: (value: T) => void
): CommandGroup => {
  return useCommandGroup({
    commands: HistoryCommands,
    exec: action => {
      if (HistoryValue[action](history)) {
        onChange(history.current);
      }
    },
  });
};
