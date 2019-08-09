import {CommandSpecMap, Shortcut} from '@condict/ui';

import clearSelectedCells from './clear-selected';
import toggleSelectedCellsDeriveLemma from './toggle-derive-lemma';

const commands: CommandSpecMap = {
  clearSelectedCells: {
    shortcut: Shortcut.parse('Delete Backspace'),
    exec: clearSelectedCells,
  },

  toggleDeriveLemma: {
    shortcut: Shortcut.parse('Primary+D d'),
    exec: toggleSelectedCellsDeriveLemma,
  },
};

export default commands;
