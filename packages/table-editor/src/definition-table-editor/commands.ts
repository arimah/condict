import {CommandSpecMap, Shortcut} from '@condict/ui';

import {deleteSelected, restoreSelected} from './operations';
import {DefinitionTableCommandFn} from './types';

const commands: CommandSpecMap<DefinitionTableCommandFn> = {
  deleteSelectedForms: {
    shortcut: Shortcut.parse('Delete Backspace'),
    action: deleteSelected,
  },

  restoreSelectedForms: {
    action: restoreSelected,
  },
};

export default commands;
