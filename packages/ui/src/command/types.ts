import {KeyboardEvent as SyntheticKeyboardEvent} from 'react';

import {Shortcut, ShortcutMap} from '../shortcut';

type AnyKeyboardEvent = KeyboardEvent | SyntheticKeyboardEvent;

export type DefaultExecFn = () => void;

export interface CommandSpec<T = DefaultExecFn> {
  readonly action: T;
  readonly disabled?: boolean;
  readonly shortcut?: Shortcut | string | string[] | null;
}

export interface CommandSpecMap<T = DefaultExecFn> {
  readonly [key: string]: CommandSpec<T>;
}

export interface Command {
  readonly exec: () => void;
  readonly disabled: boolean;
  readonly shortcut: Shortcut | null;
}

export interface CommandGroup {
  /** The commands in the group, indexed by name. */
  readonly commands: ReadonlyMap<string, Command>;
  /**
   * The commands in the group, indexed by shortcut key. If a command does not
   * have a shortcut key, it will not be present in this map.
   */
  readonly keyMap: ShortcutMap<Command>;
}

export const CommandGroup = {
  /**
   * Gets the command with the specified name.
   * @param group The group to search.
   * @param name The command name to look for.
   * @return The command, or null if no such command was found.
   */
  get(group: CommandGroup, name: string): Command | null {
    return group.commands.get(name) || null;
  },

  /**
   * Executes the command with the specified name. If the command is disabled,
   * this function is a no-op.
   * @param group The group to search.
   * @param name The command to execute.
   * @return True if the command was found and executed; false if the command
   *         could not be found or the command was disabled.
   */
  exec(group: CommandGroup, name: string): boolean {
    const command = CommandGroup.get(group, name);
    if (command && !command.disabled) {
      command.exec();
      return true;
    }
    return false;
  },

  /**
   * Executes the command whose shortcut matches a key event.
   *
   * If the keyboard event has had its default prevented (`e.defaultPrevented`
   * is true), this function is a no-op. If a matching command is found and
   * executed, this function calls `e.preventDefault()`.
   * @param group The group to search.
   * @param e The keyboard event to handle.
   * @return True if the keyboard event was handled (the event was not already
   *         handled, a command was found, and the command was not disabled);
   *         false if the event was already handled, no command was found, or
   *         the command was disabled.
   */
  handleKey(group: CommandGroup, e: AnyKeyboardEvent): boolean {
    if (!e.defaultPrevented) {
      const command = group.keyMap.get(e);
      if (command && !command.disabled) {
        e.preventDefault();
        command.exec();
        return true;
      }
    }
    return false;
  },
};

/**
 * Represents a linked list of command groups. The `useCommand` hook can access
 * commands from any command group in the linked list; that is, if you have
 * something like this:
 *
 *   <CommandProvider commands={outerCommands}>
 *     <CommandProvider commands={innerCommands}>
 *       <MyToolbar/>
 *     </CommandProvider>
 *   </CommandProvider>
 *
 * then `MyToolbar` and anything inside it will be able to access the inner as
 * well as the outer commands.
 */
export interface CommandGroupChain {
  readonly commands: CommandGroup;
  readonly parent: CommandGroupChain | null;
}

export const CommandGroupChain = {
  get(chain: CommandGroupChain, name: string): Command | null {
    let current: CommandGroupChain | null = chain;
    while (current) {
      const command = CommandGroup.get(current.commands, name);
      if (command) {
        return command;
      }
      current = current.parent;
    }
    return null;
  },
};
