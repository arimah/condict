import {CommandSpecMap, Shortcut, ShortcutGroup} from '@condict/ui';

import {Table} from '../value';
import {MoveDelta, move} from '../operations';

const commands: CommandSpecMap = {
  moveUp: {
    shortcut: Shortcut.parse('ArrowUp'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.PREV,
      MoveDelta.NONE
    ),
  },

  moveToFirstRow: {
    shortcut: Shortcut.parse('Primary+ArrowUp'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.FIRST,
      MoveDelta.NONE
    ),
  },

  moveDown: {
    shortcut: Shortcut.parse('ArrowDown'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NEXT,
      MoveDelta.NONE
    ),
  },

  moveToLastRow: {
    shortcut: Shortcut.parse('Primary+ArrowDown'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.LAST,
      MoveDelta.NONE
    ),
  },

  moveLeft: {
    shortcut: Shortcut.parse('ArrowLeft'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NONE,
      MoveDelta.PREV
    ),
  },

  moveToFirstColumn: {
    shortcut: ShortcutGroup.parse(['Primary+ArrowLeft', 'Home']),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NONE,
      MoveDelta.FIRST
    ),
  },

  moveRight: {
    shortcut: Shortcut.parse('ArrowRight'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NONE,
      MoveDelta.NEXT
    ),
  },

  moveToLastColumn: {
    shortcut: ShortcutGroup.parse(['Primary+ArrowRight', 'End']),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.NONE,
      MoveDelta.LAST
    ),
  },

  moveToFirstCell: {
    shortcut: Shortcut.parse('Primary+Home'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.FIRST,
      MoveDelta.FIRST
    ),
  },

  moveToLastCell: {
    shortcut: Shortcut.parse('Primary+End'),
    exec: <D>(table: Table<D>): Table<D> => move(
      table,
      MoveDelta.LAST,
      MoveDelta.LAST
    ),
  },
};

export default commands;
