import {CommandSpecMap, Shortcut} from '@condict/ui';

import {clearSelected, toggleDeriveLemma} from './operations';
import {InflectionTableCommandFn} from './types';

const commands: CommandSpecMap<InflectionTableCommandFn> = {
  clearSelectedCells: {
    shortcut: Shortcut.parse('Delete Backspace'),
    action: clearSelected,
  },

  toggleDeriveLemma: {
    shortcut: Shortcut.parse('Primary+D d'),
    action: toggleDeriveLemma,
  },
};

export default commands;
