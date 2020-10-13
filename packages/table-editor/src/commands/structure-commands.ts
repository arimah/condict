import {CommandSpecMap, Shortcut} from '@condict/ui';

import {Table} from '../value';
import {
  deleteSelectedColumns,
  deleteSelectedRows,
  insertColumn,
  insertRow,
  toggleHeaderSelected,
  mergeSelected,
  separateSelected,
} from '../operations';

import {TableCommandFn} from './types';

const commands: CommandSpecMap<TableCommandFn> = {
  deleteSelectedRows: {
    shortcut: Shortcut.parse('Primary+Delete'),
    action: deleteSelectedRows,
  },

  deleteSelectedColumns: {
    shortcut: Shortcut.parse('Primary+Shift+Delete'),
    action: deleteSelectedColumns,
  },

  insertRowAbove: {
    shortcut: Shortcut.parse('Primary+I i'),
    action: <D>(table: Table<D>): Table<D> => insertRow(table, 'before'),
  },

  insertRowAtTop: {
    shortcut: Shortcut.parse('Primary+Shift+I i'),
    action: <D>(table: Table<D>): Table<D> => insertRow(table, 'start'),
  },

  insertRowBelow: {
    shortcut: Shortcut.parse('Primary+K k'),
    action: <D>(table: Table<D>): Table<D> => insertRow(table, 'after'),
  },

  insertRowAtBottom: {
    shortcut: Shortcut.parse('Primary+Shift+K k'),
    action: <D>(table: Table<D>): Table<D> => insertRow(table, 'end'),
  },

  insertColumnBefore: {
    shortcut: Shortcut.parse('Primary+J j'),
    action: <D>(table: Table<D>): Table<D> => insertColumn(table, 'before'),
  },

  insertColumnAtStart: {
    shortcut: Shortcut.parse('Primary+Shift+J j'),
    action: <D>(table: Table<D>): Table<D> => insertColumn(table, 'start'),
  },

  insertColumnAfter: {
    shortcut: Shortcut.parse('Primary+L l'),
    action: <D>(table: Table<D>): Table<D> => insertColumn(table, 'after'),
  },

  insertColumnAtEnd: {
    shortcut: Shortcut.parse('Primary+Shift+L l'),
    action: <D>(table: Table<D>): Table<D> => insertColumn(table, 'end'),
  },

  toggleHeader: {
    shortcut: Shortcut.parse('Primary+H h'),
    action: toggleHeaderSelected,
  },

  mergeSelection: {
    shortcut: Shortcut.parse('Primary+M m'),
    action: mergeSelected,
  },

  separateSelection: {
    shortcut: Shortcut.parse('Primary+U u'),
    action: separateSelected,
  },
};

export default commands;
