import {CommandSpecMap, Shortcut} from '@condict/ui';

import {deleteSelected, restoreSelected} from './operations';

const commands: CommandSpecMap = {
  deleteSelectedForms: {
    shortcut: Shortcut.parse('Delete Backspace'),
    exec: deleteSelected,
  },

  restoreSelectedForms: {
    exec: restoreSelected,
  },
};

export default commands;
