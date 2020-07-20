import {Shortcut} from '../shortcut';

export type DefaultExecFn = () => void;

export interface Command<T = DefaultExecFn> {
  readonly disabled: boolean;
  readonly exec: T;
  readonly shortcut: Shortcut | null;
}

export interface CommandSpec<T = DefaultExecFn> {
  readonly disabled?: boolean;
  readonly exec: T;
  readonly shortcut?: Shortcut | string | string[] | null;
}

export interface CommandSpecMap<T = DefaultExecFn> {
  readonly [key: string]: CommandSpec<T>;
}

export interface BoundCommand {
  readonly disabled: boolean;
  readonly exec: () => void;
  readonly shortcut: Shortcut | null;
}

export interface ContextValue<T> {
  readonly commandMap: Map<string, Command<T>>;
  readonly onExec: (cmd: Command<T>) => void;
  readonly parent: ContextValue<any> | null;
}
