import {CommandSpecMap, Shortcut} from '@condict/ui';

import {Table} from '../value';
import {MoveDelta, move, selectAll} from '../operations';

import {TableCommandFn} from './types';

const commands: CommandSpecMap<TableCommandFn> = {
  selectEntireTable: {
    shortcut: Shortcut.parse('Primary+A a'),
    exec: selectAll,
  },

  selectUp: {
    shortcut: Shortcut.parse('Shift+ArrowUp'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.PREV,
      MoveDelta.NONE,
      true
    ),
  },

  selectToFirstRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowUp'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.FIRST,
      MoveDelta.NONE,
      true
    ),
  },

  selectDown: {
    shortcut: Shortcut.parse('Shift+ArrowDown'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NEXT,
      MoveDelta.NONE,
      true
    ),
  },

  selectToLastRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowDown'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.LAST,
      MoveDelta.NONE,
      true
    ),
  },

  selectLeft: {
    shortcut: Shortcut.parse('Shift+ArrowLeft'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NONE,
      MoveDelta.PREV,
      true
    ),
  },

  selectToFirstColumn: {
    shortcut: Shortcut.parse(['Primary+Shift+ArrowLeft', 'Shift+Home']),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NONE,
      MoveDelta.FIRST,
      true
    ),
  },

  selectRight: {
    shortcut: Shortcut.parse('Shift+ArrowRight'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NONE,
      MoveDelta.NEXT,
      true
    ),
  },

  selectToLastColumn: {
    shortcut: Shortcut.parse(['Primary+Shift+ArrowRight', 'Shift+End']),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NONE,
      MoveDelta.LAST,
      true
    ),
  },

  selectToFirstCell: {
    shortcut: Shortcut.parse('Primary+Shift+Home'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.FIRST,
      MoveDelta.FIRST,
      true
    ),
  },

  selectToLastCell: {
    shortcut: Shortcut.parse('Primary+Shift+End'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.LAST,
      MoveDelta.LAST,
      true
    ),
  },
};

export default commands;
