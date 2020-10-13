import {CommandSpecMap, Shortcut} from '@condict/ui';

import {Table} from '../value';
import {move, selectAll} from '../operations';

import {TableCommandFn} from './types';

const commands: CommandSpecMap<TableCommandFn> = {
  selectEntireTable: {
    shortcut: Shortcut.parse('Primary+A a'),
    action: selectAll,
  },

  selectUp: {
    shortcut: Shortcut.parse('Shift+ArrowUp'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'prev', 'stay', true),
  },

  selectToFirstRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowUp'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'first', 'stay', true),
  },

  selectDown: {
    shortcut: Shortcut.parse('Shift+ArrowDown'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'next', 'stay', true),
  },

  selectToLastRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowDown'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'last', 'stay', true),
  },

  selectLeft: {
    shortcut: Shortcut.parse('Shift+ArrowLeft'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'prev', true),
  },

  selectToFirstColumn: {
    shortcut: Shortcut.parse(['Primary+Shift+ArrowLeft', 'Shift+Home']),
    action: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'first', true),
  },

  selectRight: {
    shortcut: Shortcut.parse('Shift+ArrowRight'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'next', true),
  },

  selectToLastColumn: {
    shortcut: Shortcut.parse(['Primary+Shift+ArrowRight', 'Shift+End']),
    action: <D>(table: Table<D>): Table<D> => move(table, 'stay', 'last', true),
  },

  selectToFirstCell: {
    shortcut: Shortcut.parse('Primary+Shift+Home'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'first', 'first', true),
  },

  selectToLastCell: {
    shortcut: Shortcut.parse('Primary+Shift+End'),
    action: <D>(table: Table<D>): Table<D> => move(table, 'last', 'last', true),
  },
};

export default commands;
