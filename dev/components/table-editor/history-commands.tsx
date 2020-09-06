import React, {ReactNode, useCallback} from 'react';

import {CommandGroup, Shortcuts} from '@condict/ui';

import {HistoryStack} from './history-stack';
import * as S from './styles';

export type Props<T> = {
  value: HistoryStack<T>;
  disabled?: boolean;
  onChange: (value: HistoryStack<T>) => void;
  children: ReactNode;
};

function HistoryCommands<T>(props: Props<T>): JSX.Element {
  const {value, disabled = false, onChange, children} = props;

  const handleUndo = useCallback(() => {
    onChange(HistoryStack.undo(value));
  }, [value, onChange]);

  const handleRedo = useCallback(() => {
    onChange(HistoryStack.redo(value));
  }, [value, onChange]);

  return (
    <CommandGroup
      as={S.EditorContainer}
      disabled={disabled}
      commands={{
        undo: {
          shortcut: Shortcuts.undo,
          disabled: !HistoryStack.canUndo(value),
          exec: handleUndo,
        },
        redo: {
          shortcut: Shortcuts.redo,
          disabled: !HistoryStack.canRedo(value),
          exec: handleRedo,
        },
      }}
      onExec={cmd => cmd.exec()}
    >
      {children}
    </CommandGroup>
  );
}

export default HistoryCommands;
