import {CommandSpecMap, Shortcut} from '@condict/ui';

import {Table} from '../value';
import {
  InsertLocation,
  deleteSelectedColumns,
  deleteSelectedRows,
  insertColumn,
  insertRow,
  toggleHeaderSelected,
  mergeSelected,
  separateSelected,
} from '../operations';

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
    exec: <D>(table: Table<D>): Table<D> => insertRow(
      table,
      InsertLocation.BEFORE
    ),
  },

  insertRowAtTop: {
    shortcut: Shortcut.parse('Primary+Shift+I i'),
    exec: <D>(table: Table<D>): Table<D> => insertRow(
      table,
      InsertLocation.START
    ),
  },

  insertRowBelow: {
    shortcut: Shortcut.parse('Primary+K k'),
    exec: <D>(table: Table<D>): Table<D> => insertRow(
      table,
      InsertLocation.AFTER
    ),
  },

  insertRowAtBottom: {
    shortcut: Shortcut.parse('Primary+Shift+K k'),
    exec: <D>(table: Table<D>): Table<D> => insertRow(
      table,
      InsertLocation.END
    ),
  },

  insertColumnBefore: {
    shortcut: Shortcut.parse('Primary+J j'),
    exec: <D>(table: Table<D>): Table<D> => insertColumn(
      table,
      InsertLocation.BEFORE
    ),
  },

  insertColumnAtStart: {
    shortcut: Shortcut.parse('Primary+Shift+J j'),
    exec: <D>(table: Table<D>): Table<D> => insertColumn(
      table,
      InsertLocation.START
    ),
  },

  insertColumnAfter: {
    shortcut: Shortcut.parse('Primary+L l'),
    exec: <D>(table: Table<D>): Table<D> => insertColumn(
      table,
      InsertLocation.AFTER
    ),
  },

  insertColumnAtEnd: {
    shortcut: Shortcut.parse('Primary+Shift+L l'),
    exec: <D>(table: Table<D>): Table<D> => insertColumn(
      table,
      InsertLocation.END
    ),
  },

  toggleHeader: {
    shortcut: Shortcut.parse('Primary+H h'),
    exec: toggleHeaderSelected,
  },

  mergeSelection: {
    shortcut: Shortcut.parse('Primary+M m'),
    exec: mergeSelected,
  },

  separateSelection: {
    shortcut: Shortcut.parse('Primary+U u'),
    exec: separateSelected,
  },
};

export default commands;
