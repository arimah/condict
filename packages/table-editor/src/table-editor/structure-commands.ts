import {CommandSpecMap, Shortcut} from '@condict/ui';

import Value from '../value';
import {
  deleteSelectedColumns,
  deleteSelectedRows,
} from '../value-helpers/delete';
import {
  insertRow,
  insertColumn,
  InsertLocation,
} from '../value-helpers/insert';
import toggleSelectedCellsHeader from '../value-helpers/toggle-header';
import mergeSelectedCells from '../value-helpers/merge';
import separateSelectedCells from '../value-helpers/separate';

const commands: CommandSpecMap = {
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
    exec: <D, V extends Value<D>>(value: V) => insertRow<D, V>(
      value,
      InsertLocation.BEFORE
    ),
  },

  insertRowAtTop: {
    shortcut: Shortcut.parse('Primary+Shift+I i'),
    exec: <D, V extends Value<D>>(value: V) => insertRow<D, V>(
      value,
      InsertLocation.START
    ),
  },

  insertRowBelow: {
    shortcut: Shortcut.parse('Primary+K k'),
    exec: <D, V extends Value<D>>(value: V) => insertRow<D, V>(
      value,
      InsertLocation.AFTER
    ),
  },

  insertRowAtBottom: {
    shortcut: Shortcut.parse('Primary+Shift+K k'),
    exec: <D, V extends Value<D>>(value: V) => insertRow<D, V>(
      value,
      InsertLocation.END
    ),
  },

  insertColumnBefore: {
    shortcut: Shortcut.parse('Primary+J j'),
    exec: <D, V extends Value<D>>(value: V) => insertColumn<D, V>(
      value,
      InsertLocation.BEFORE
    ),
  },

  insertColumnAtStart: {
    shortcut: Shortcut.parse('Primary+Shift+J j'),
    exec: <D, V extends Value<D>>(value: V) => insertColumn<D, V>(
      value,
      InsertLocation.START
    ),
  },

  insertColumnAfter: {
    shortcut: Shortcut.parse('Primary+L l'),
    exec: <D, V extends Value<D>>(value: V) => insertColumn<D, V>(
      value,
      InsertLocation.AFTER
    ),
  },

  insertColumnAtEnd: {
    shortcut: Shortcut.parse('Primary+Shift+L l'),
    exec: <D, V extends Value<D>>(value: V) => insertColumn<D, V>(
      value,
      InsertLocation.END
    ),
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
};

export default commands;
