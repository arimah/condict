import {CommandSpecMap, Shortcut} from '@condict/ui';

import deleteSelectedForms from './delete-selected';

const commands: CommandSpecMap = {
  deleteSelectedForms: {
    shortcut: Shortcut.parse('Delete Backspace'),
    exec: deleteSelectedForms,
  },
};

export default commands;
