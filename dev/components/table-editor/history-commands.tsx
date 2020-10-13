import React, {ReactNode, KeyboardEvent, useCallback} from 'react';

import {
  CommandGroup,
  CommandProvider,
  Shortcuts,
  useCommandGroup,
} from '@condict/ui';

import {HistoryStack} from './history-stack';
import * as S from './styles';

export type Props<T> = {
  value: HistoryStack<T>;
  disabled?: boolean;
  onChange: (value: HistoryStack<T>) => void;
  children: ReactNode;
};

type HistoryCommandFn<T> = (value: HistoryStack<T>) => HistoryStack<T>;

function HistoryCommands<T>(props: Props<T>): JSX.Element {
  const {value, disabled = false, onChange, children} = props;

  const commands = useCommandGroup<HistoryCommandFn<T>>({
    commands: {
      undo: {
        shortcut: Shortcuts.undo,
        disabled: !HistoryStack.canUndo(value),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        action: HistoryStack.undo,
      },
      redo: {
        shortcut: Shortcuts.redo,
        disabled: !HistoryStack.canRedo(value),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        action: HistoryStack.redo,
      },
    },
    exec: action => {
      onChange(action(value));
    },
    disabled,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    CommandGroup.handleKey(commands, e);
  }, [commands]);

  return (
    <CommandProvider commands={commands}>
      <S.EditorContainer onKeyDown={handleKeyDown}>
        {children}
      </S.EditorContainer>
    </CommandProvider>
  );
}

export default HistoryCommands;
