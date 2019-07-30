import {Shortcut} from '@condict/ui';

import {
  deleteSelectedColumns,
  deleteSelectedRows,
} from '../value-helpers/delete';
import {
  insertRow,
  insertColumn,
  INSERT_START,
  INSERT_BEFORE,
  INSERT_AFTER,
  INSERT_END,
} from '../value-helpers/insert';
import toggleSelectedCellsHeader from '../value-helpers/toggle-header';
import mergeSelectedCells from '../value-helpers/merge';
import separateSelectedCells from '../value-helpers/separate';

export default Object.freeze({
  deleteSelectedRows: {
    shortcut: Shortcut.parse('Primary+Delete'),
    exec: deleteSelectedRows,
  },

  deleteSelectedColumns: {
    shortcut: Shortcut.parse('Primary+Shift+Delete'),
    exec: deleteSelectedColumns,
  },

  insertRowAbove: {
    shortcut: Shortcut.parse('Primary+I i'),
    exec: value => insertRow(value, INSERT_BEFORE),
  },

  insertRowAtTop: {
    shortcut: Shortcut.parse('Primary+Shift+I i'),
    exec: value => insertRow(value, INSERT_START),
  },

  insertRowBelow: {
    shortcut: Shortcut.parse('Primary+K k'),
    exec: value => insertRow(value, INSERT_AFTER),
  },

  insertRowAtBottom: {
    shortcut: Shortcut.parse('Primary+Shift+K k'),
    exec: value => insertRow(value, INSERT_END),
  },

  insertColumnBefore: {
    shortcut: Shortcut.parse('Primary+J j'),
    exec: value => insertColumn(value, INSERT_BEFORE),
  },

  insertColumnAtStart: {
    shortcut: Shortcut.parse('Primary+Shift+J j'),
    exec: value => insertColumn(value, INSERT_START),
  },

  insertColumnAfter: {
    shortcut: Shortcut.parse('Primary+L l'),
    exec: value => insertColumn(value, INSERT_AFTER),
  },

  insertColumnAtEnd: {
    shortcut: Shortcut.parse('Primary+Shift+L l'),
    exec: value => insertColumn(value, INSERT_END),
  },

  toggleHeader: {
    shortcut: Shortcut.parse('Primary+H h'),
    exec: toggleSelectedCellsHeader,
  },

  mergeSelection: {
    shortcut: Shortcut.parse('Primary+M m'),
    exec: mergeSelectedCells,
  },

  separateSelection: {
    shortcut: Shortcut.parse('Primary+U u'),
    exec: separateSelectedCells,
  },
});
