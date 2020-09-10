import {CommandSpecMap, Shortcut} from '@condict/ui';

import {Table} from '../value';
import {move} from '../operations';

import {TableCommandFn} from './types';

const commands: CommandSpecMap<TableCommandFn> = {
  moveUp: {
    shortcut: Shortcut.parse('ArrowUp'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'prev', 'stay'),
  },

  moveToFirstRow: {
    shortcut: Shortcut.parse('Primary+ArrowUp'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'first', 'stay'),
  },

  moveDown: {
    shortcut: Shortcut.parse('ArrowDown'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'next', 'stay'),
  },

  moveToLastRow: {
    shortcut: Shortcut.parse('Primary+ArrowDown'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'last', 'stay'),
  },

  moveLeft: {
    shortcut: Shortcut.parse('ArrowLeft'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'prev'),
  },

  moveToFirstColumn: {
    shortcut: Shortcut.parse(['Primary+ArrowLeft', 'Home']),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'first'),
  },

  moveRight: {
    shortcut: Shortcut.parse('ArrowRight'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'next'),
  },

  moveToLastColumn: {
    shortcut: Shortcut.parse(['Primary+ArrowRight', 'End']),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'last'),
  },

  moveToFirstCell: {
    shortcut: Shortcut.parse('Primary+Home'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'first', 'first'),
  },

  moveToLastCell: {
    shortcut: Shortcut.parse('Primary+End'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'last', 'last'),
  },
};

export default commands;
