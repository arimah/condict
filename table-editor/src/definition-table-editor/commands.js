import {Shortcut} from '@condict/admin-ui';

import deleteSelectedForms from './delete-selected';

export default Object.freeze({
  deleteSelectedForms: {
    shortcut: Shortcut.parse('Delete Backspace'),
    exec: deleteSelectedForms,
  },
});
