import {CommandSpecMap, Shortcut} from '@condict/ui';

import {Table} from '../value';
import {move, selectAll} from '../operations';

import {TableCommandFn} from './types';

const commands: CommandSpecMap<TableCommandFn> = {
  selectEntireTable: {
    shortcut: Shortcut.parse('Primary+A a'),
    exec: selectAll,
  },

  selectUp: {
    shortcut: Shortcut.parse('Shift+ArrowUp'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'prev', 'stay', true),
  },

  selectToFirstRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowUp'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'first', 'stay', true),
  },

  selectDown: {
    shortcut: Shortcut.parse('Shift+ArrowDown'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'next', 'stay', true),
  },

  selectToLastRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowDown'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'last', 'stay', true),
  },

  selectLeft: {
    shortcut: Shortcut.parse('Shift+ArrowLeft'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'prev', true),
  },

  selectToFirstColumn: {
    shortcut: Shortcut.parse(['Primary+Shift+ArrowLeft', 'Shift+Home']),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'first', true),
  },

  selectRight: {
    shortcut: Shortcut.parse('Shift+ArrowRight'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'next', true),
  },

  selectToLastColumn: {
    shortcut: Shortcut.parse(['Primary+Shift+ArrowRight', 'Shift+End']),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'last', true),
  },

  selectToFirstCell: {
    shortcut: Shortcut.parse('Primary+Shift+Home'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'first', 'first', true),
  },

  selectToLastCell: {
    shortcut: Shortcut.parse('Primary+Shift+End'),
    exec: <D>(table: Table<D>): Table<D> => move(table, 'last', 'last', true),
  },
};

export default commands;
