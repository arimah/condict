import {CommandSpecMap, Shortcut} from '@condict/ui';

import {clearSelected, toggleDeriveLemma} from './operations';

const commands: CommandSpecMap = {
  clearSelectedCells: {
    shortcut: Shortcut.parse('Delete Backspace'),
    exec: clearSelected,
  },

  toggleDeriveLemma: {
    shortcut: Shortcut.parse('Primary+D d'),
    exec: toggleDeriveLemma,
  },
};

export default commands;
