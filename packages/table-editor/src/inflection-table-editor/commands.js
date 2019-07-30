import {Shortcut} from '@condict/ui';

import clearSelectedCells from './clear-selected';
import toggleSelectedCellsDeriveLemma from './toggle-derive-lemma';

export default Object.freeze({
  clearSelectedCells: {
    shortcut: Shortcut.parse('Delete Backspace'),
    exec: clearSelectedCells,
  },

  toggleDeriveLemma: {
    shortcut: Shortcut.parse('Primary+D d'),
    exec: toggleSelectedCellsDeriveLemma,
  },
});
