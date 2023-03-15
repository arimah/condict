import {CommandGroup, CommandSpecMap, useCommandGroup} from '@condict/ui';

import {Table} from './value';

export type TableCommandFn<D> = (table: Table<D>) => Table<D>;

export type Options<D> = {
  value: Table<D>;
  onChange: (value: Table<D>) => void;
  commands: CommandSpecMap<TableCommandFn<D>>;
  disabled?: boolean;
};

export default function useTableCommands<D>(options: Options<D>): CommandGroup {
  const {disabled = false, commands, value, onChange} = options;
  return useCommandGroup({
    commands,
    disabled,
    exec: cmd => {
      const nextValue = cmd(value);
      onChange(nextValue);
    },
  });
}
