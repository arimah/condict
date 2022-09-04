import {CommandSpecMap, Shortcut, WritingDirection} from '@condict/ui';

import {Table} from '../value';
import {move} from '../operations';

import {TableCommandFn} from './types';

const getCommands = (
  dir: WritingDirection
): CommandSpecMap<TableCommandFn> => ({
  moveUp: {
    shortcut: Shortcut.parse('ArrowUp'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'prev', 'stay'),
  },

  moveToFirstRow: {
    shortcut: Shortcut.parse('Primary+ArrowUp'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'first', 'stay'),
  },

  moveDown: {
    shortcut: Shortcut.parse('ArrowDown'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'next', 'stay'),
  },

  moveToLastRow: {
    shortcut: Shortcut.parse('Primary+ArrowDown'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'last', 'stay'),
  },

  moveLeft: {
    shortcut: Shortcut.parse(dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'prev'),
  },

  moveToFirstColumn: {
    shortcut: Shortcut.parse([
      dir === 'rtl' ? 'Primary+ArrowRight' : 'Primary+ArrowLeft',
      'Home',
    ]),
    action: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'first'),
  },

  moveRight: {
    shortcut: Shortcut.parse(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'next'),
  },

  moveToLastColumn: {
    shortcut: Shortcut.parse([
      dir === 'rtl' ? 'Primary+ArrowLeft' : 'Primary+ArrowRight',
      'End',
    ]),
    action: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'last'),
  },

  moveToFirstCell: {
    shortcut: Shortcut.parse('Primary+Home'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'first', 'first'),
  },

  moveToLastCell: {
    shortcut: Shortcut.parse('Primary+End'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'last', 'last'),
  },
});

export default getCommands;
