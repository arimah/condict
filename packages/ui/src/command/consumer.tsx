import {useContext, useMemo} from 'react';

import {Context} from './group';
import {ContextValue, BoundCommand} from './types';

export type Props = {
  name: string;
  children: (command: BoundCommand | null) => JSX.Element;
};

export const CommandConsumer = (props: Props): JSX.Element => {
  const {name, children} = props;

  const context = useContext(Context);
  const command = useMemo(() => getCommand(name, context), [name, context]);
  return useMemo(() => children(command), [children, command]);
};

export const useCommand = (
  name: string | undefined | null
): BoundCommand | null => {
  const context = useContext(Context);
  const command = useMemo(
    () => name != null ? getCommand(name, context) : null,
    [name, context]
  );
  return command;
};

const getCommand = (
  name: string,
  context: ContextValue<any> | null
): BoundCommand | null => {
  if (context !== null) {
    const cmd = context.commandMap.get(name);
    if (cmd) {
      return {
        disabled: cmd.disabled,
        exec: () => { context.onExec(cmd); },
        shortcut: cmd.shortcut,
      };
    }

    if (context.parent) {
      return getCommand(name, context.parent);
    }
  }
  return null;
};
