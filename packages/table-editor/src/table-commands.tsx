import {useCallback, useRef} from 'react';

import {CommandGroup, CommandSpecMap, useCommandGroup} from '@condict/ui';

import {Table} from './value';

export type TableCommandFn<D> = (table: Table<D>) => Table<D>;

export type Options<D> = {
  value: Table<D>;
  onChange: (value: Table<D>) => void;
  commands: CommandSpecMap<TableCommandFn<D>>;
  disabled?: boolean;
};

function useTableCommands<D>(options: Options<D>): CommandGroup {
  // Store some options in a ref to avoid rebuilding the command map
  // every time the table changes.
  const {disabled = false, commands, ...otherOptions} = options;
  const opts = useRef(otherOptions);
  opts.current = otherOptions;

  const exec = useCallback((cmd: TableCommandFn<D>) => {
    const nextValue = cmd(opts.current.value);
    opts.current.onChange(nextValue);
  }, []);

  return useCommandGroup({commands, exec, disabled});
}

export default useTableCommands;
