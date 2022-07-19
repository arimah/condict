import {useContext} from 'react';

import {Context} from './group';
import {CommandGroupChain, Command} from './types';

export const useCommand = (
  name: string | undefined | null
): Command | null => {
  const group = useContext(Context);
  return group && name != null ? CommandGroupChain.get(group, name) : null;
};
