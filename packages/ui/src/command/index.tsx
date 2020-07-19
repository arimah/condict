import React, {
  KeyboardEvent,
  KeyboardEventHandler,
  ReactNode,
  useContext,
  useMemo,
  useCallback,
} from 'react';

import {Shortcut, ShortcutMap} from '../shortcut';

export type Command = {
  disabled: boolean;
  exec: (...args: any[]) => any;
  shortcut: Shortcut | null;
};

export type CommandSpec = {
  disabled?: boolean;
  exec: (...args: any[]) => any;
  shortcut?: Shortcut | string | string[] | null;
};

export type CommandSpecMap = {
  [key: string]: CommandSpec;
};

type ContextValue = {
  readonly commandMap: Map<string, Command>;
  readonly onExec: (cmd: Command) => void;
  readonly parent: ContextValue | null;
};

export type BoundCommand = {
  readonly disabled: boolean;
  readonly exec: () => void;
  readonly shortcut: Shortcut | null;
};

const Context = React.createContext<ContextValue | null>(null);

function buildCommandMap(
  commands: CommandSpecMap,
  groupDisabled: boolean
): [Map<string, Command>, ShortcutMap<Command>] {
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
  }, new Map<string, Command>());

  const keyMap = new ShortcutMap<Command>(
    Array.from(commandMap.values()),
    cmd => cmd.shortcut
  );

  return [commandMap, keyMap];
}

function getContextValue(
  commandMap: Map<string, Command>,
  onExec: (cmd: Command) => void,
  parent: ContextValue | null
): ContextValue {
  return {
    commandMap,
    onExec,
    parent,
  };
}

export type Props = {
  commands: CommandSpecMap;
  className?: string;
  disabled?: boolean;
  onExec?: (cmd: Command) => void;
  onKeyDown?: KeyboardEventHandler<HTMLElement> | null;
  children: ReactNode;
};

const DefaultOnExec = (cmd: Command) => cmd.exec();

export function CommandGroup<
  E extends keyof JSX.IntrinsicElements | React.ComponentType<unknown> = 'div'
>(
  props: Props & Omit<React.ComponentPropsWithoutRef<E>, 'onKeyDown'> & {
    as?: E;
  }
): JSX.Element {
  const {
    as,
    commands,
    disabled = false,
    onExec = DefaultOnExec,
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
      if (!disabled) {
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

export type ConsumerProps = {
  name: string;
  children: (command: BoundCommand | null) => JSX.Element;
};

export const CommandConsumer = (props: ConsumerProps): JSX.Element => {
  const {name, children} = props;

  const context = useContext(Context);
  const command = useMemo(() => getCommand(name, context), [name, context]);
  return useMemo(() => children(command), [children, command]);
};

export const useCommand = (name: string | undefined | null): BoundCommand | null => {
  const context = useContext(Context);
  const command = useMemo(
    () => name != null ? getCommand(name, context) : null,
    [name, context]
  );
  return command;
};

const getCommand = (
  name: string,
  context: ContextValue | null
): BoundCommand | null => {
  if (context !== null) {
    const cmd = context.commandMap.get(name);
    if (cmd) {
      return Object.freeze({
        disabled: cmd.disabled,
        exec: () => { context.onExec(cmd); },
        shortcut: cmd.shortcut,
      });
    }

    if (context.parent) {
      return getCommand(name, context.parent);
    }
  }
  return null;
};
