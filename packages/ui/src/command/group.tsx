import React, {ReactNode, useMemo, useCallback, useRef, useContext} from 'react';

import {Shortcut, ShortcutMap} from '../shortcut';

import {
  Command,
  CommandSpecMap,
  CommandGroup,
  CommandGroupChain,
  DefaultExecFn,
} from './types';

export const Context = React.createContext<CommandGroupChain | null>(null);

export type Options<T> = {
  /** Specifies the commands in this group. */
  commands: CommandSpecMap<T>;
  /**
   * Executes a command in this group. The command's `exec` property is passed
   * as the argument, and this function is responsible for handling it in an
   * appropriate manner.
   */
  exec: (cmd: T) => void;
  /** If true, every command in the group is disabled. */
  disabled?: boolean;
};

export function useCommandGroup<T = DefaultExecFn>(
  options: Options<T>
): CommandGroup {
  const {commands, exec, disabled: groupDisabled = false} = options;

  // The exec function often captures things like current input value, which is
  // liable to change often. Store that in a ref so we don't need to recompute
  // the command map when e.g. users type.
  const execRef = useRef(exec);
  execRef.current = exec;
  const handleExec = useCallback((cmd: T) => {
    execRef.current(cmd);
  }, []);

  return useMemo<CommandGroup>(() => {
    const commandMap = Object.keys(commands).reduce((map, name) => {
      const {action, disabled = false, shortcut = null} = commands[name];

      map.set(name, {
        exec: () => handleExec(action),
        disabled: groupDisabled || disabled,
        shortcut:
          typeof shortcut === 'string' || Array.isArray(shortcut)
            ? Shortcut.parse(shortcut)
            : shortcut,
      });
      return map;
    }, new Map<string, Command>());

    const keyMap = new ShortcutMap<Command>(
      Array.from(commandMap.values()),
      cmd => cmd.shortcut
    );

    return {
      commands: commandMap,
      keyMap,
    };
  }, [commands, handleExec, groupDisabled]);
}

export type CommandProviderProps = {
  commands: CommandGroup;
  children?: ReactNode;
};

export const CommandProvider = React.memo((props: CommandProviderProps) => {
  const {commands, children} = props;

  const parent = useContext(Context);

  const value = useMemo<CommandGroupChain>(() => ({
    commands,
    parent,
  }), [commands, parent]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
});

CommandProvider.displayName = 'CommandProvider';
