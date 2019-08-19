import {CommandSpecMap, Shortcut} from '@condict/ui';

import deleteSelectedForms from './delete-selected';
import restoreSelectedForms from './restore-selected';

const commands: CommandSpecMap = {
  deleteSelectedForms: {
    shortcut: Shortcut.parse('Delete Backspace'),
    exec: deleteSelectedForms,
  },
  restoreSelectedForms: {
    exec: restoreSelectedForms,
  },
};

export default commands;
