import {useContext, useMemo} from 'react';

import {Context} from './group';
import {CommandGroupChain, Command} from './types';

export type Props = {
  name: string;
  children: (command: Command | null) => JSX.Element;
};

export const CommandConsumer = (props: Props): JSX.Element => {
  const {name, children} = props;

  const group = useContext(Context);
  const command = group && CommandGroupChain.get(group, name);
  return useMemo(() => children(command), [children, command]);
};

export const useCommand = (
  name: string | undefined | null
): Command | null => {
  const group = useContext(Context);
  return group && name != null ? CommandGroupChain.get(group, name) : null;
};
