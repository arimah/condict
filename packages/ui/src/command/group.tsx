import React, {
  KeyboardEvent,
  KeyboardEventHandler,
  ReactNode,
  useContext,
  useMemo,
  useCallback,
} from 'react';

import {Shortcut, ShortcutMap} from '../shortcut';

import {Command, CommandSpecMap, ContextValue, DefaultExecFn} from './types';

export type Props<T> = {
  commands: CommandSpecMap<T>;
  onExec: (cmd: Command<T>) => void;
  disabled?: boolean;
  className?: string;
  onKeyDown?: KeyboardEventHandler<HTMLElement> | null;
  children: ReactNode;
};

export const Context = React.createContext<ContextValue<any> | null>(null);

function buildCommandMap<T>(
  commands: CommandSpecMap<T>,
  groupDisabled: boolean
): [Map<string, Command<T>>, ShortcutMap<Command<T>>] {
  const commandMap = Object.keys(commands).reduce((result, name) => {
    const cmd = commands[name];
    const {shortcut} = cmd;
    result.set(name, {
      disabled: !!(groupDisabled || cmd.disabled),
      exec: cmd.exec,
      shortcut:
        typeof shortcut === 'string' || Array.isArray(shortcut)
          ? Shortcut.parse(shortcut)
          : shortcut || null,
    });
    return result;
  }, new Map<string, Command<T>>());

  const keyMap = new ShortcutMap<Command<T>>(
    Array.from(commandMap.values()),
    cmd => cmd.shortcut
  );

  return [commandMap, keyMap];
}

function getContextValue<T>(
  commandMap: Map<string, Command<T>>,
  onExec: (cmd: Command<T>) => void,
  parent: ContextValue<any> | null
): ContextValue<T> {
  return {
    commandMap,
    onExec,
    parent,
  };
}

function CommandGroup<
  T = DefaultExecFn,
  E extends keyof JSX.IntrinsicElements | React.ComponentType<unknown> = 'div'
>(
  props: Props<T> & Omit<React.ComponentPropsWithoutRef<E>, 'onKeyDown'> & {
    as?: E;
  }
): JSX.Element {
  const {
    as,
    commands,
    disabled = false,
    onExec,
    onKeyDown,
    children,
    // className deliberately included here
    ...otherProps
  } = props;

  const parent = useContext(Context);
  const [commandMap, keyMap] = useMemo(
    () => buildCommandMap(commands, disabled),
    [commands, disabled]
  );
  const contextValue = useMemo(
    () => getContextValue(commandMap, onExec, parent),
    [commandMap, onExec, parent]
  );
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!disabled && !e.isDefaultPrevented()) {
        const cmd = keyMap.get(e);
        if (cmd && !cmd.disabled) {
          e.preventDefault();
          e.stopPropagation();
          onExec(cmd);
          return;
        }
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    },
    [disabled, keyMap, onExec, onKeyDown]
  );

  const Inner = (as || 'div') as any;
  // disabled is passed to the inner component, since it's a
  // standard HTML attribute.
  return (
    <Context.Provider value={contextValue}>
      <Inner
        {...otherProps}
        disabled={disabled}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Inner>
    </Context.Provider>
  );
}

export default CommandGroup;
