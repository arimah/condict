import {CommandSpecMap, Shortcut} from '@condict/ui';

import {deleteSelected, restoreSelected} from './operations';
import {DefinitionTableCommandFn} from './types';

const commands: CommandSpecMap<DefinitionTableCommandFn> = {
  deleteSelectedForms: {
    shortcut: Shortcut.parse('Delete Backspace'),
    exec: deleteSelected,
  },

  restoreSelectedForms: {
    exec: restoreSelected,
  },
};

export default commands;
