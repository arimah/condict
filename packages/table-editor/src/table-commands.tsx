import React, {ReactNode, useCallback} from 'react';

import {Command, CommandGroup, CommandSpecMap} from '@condict/ui';

import {Table} from './value';

export type CommandsElement =
  | keyof JSX.IntrinsicElements
  | React.ComponentType<unknown>;

export type Props<D, E extends CommandsElement> = {
  value: Table<D>;
  disabled?: boolean;
  children: ReactNode;
  onChange: (value: Table<D>) => void;
} & Omit<
  React.ComponentPropsWithoutRef<E>,
  'value' | 'disabled' | 'children' | 'onChange' | 'onKeyDown'
>;

export type TableCommandFn<D> = (table: Table<D>) => Table<D>;

const TableCommands = <D, E extends CommandsElement = 'div'>(
  props: Props<D, E> & {
    commands: CommandSpecMap<TableCommandFn<D>>;
    as?: E;
  }
): JSX.Element => {
  const {
    disabled = false,
    commands,
    children,
    value,
    onChange,
    ...otherProps
  } = props;

  const handleExec = useCallback((cmd: Command<TableCommandFn<D>>) => {
    const nextValue = cmd.exec(value);
    onChange(nextValue);
  }, [value, onChange]);

  return (
    <CommandGroup
      {...otherProps}
      commands={commands}
      disabled={disabled}
      onExec={handleExec}
    >
      {children}
    </CommandGroup>
  );
};

export default TableCommands;
