import {CommandSpecMap, Shortcut, ShortcutGroup} from '@condict/ui';

import Value from '../value';
import moveFocus, {MoveDelta} from '../value-helpers/move';

const commands: CommandSpecMap = {
  moveUp: {
    shortcut: Shortcut.parse('ArrowUp'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.PREV,
      MoveDelta.NONE
    ),
  },

  moveToFirstRow: {
    shortcut: Shortcut.parse('Primary+ArrowUp'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.FIRST,
      MoveDelta.NONE
    ),
  },

  moveDown: {
    shortcut: Shortcut.parse('ArrowDown'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NEXT,
      MoveDelta.NONE
    ),
  },

  moveToLastRow: {
    shortcut: Shortcut.parse('Primary+ArrowDown'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.LAST,
      MoveDelta.NONE
    ),
  },

  moveLeft: {
    shortcut: Shortcut.parse('ArrowLeft'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NONE,
      MoveDelta.PREV
    ),
  },

  moveToFirstColumn: {
    shortcut: ShortcutGroup.parse(['Primary+ArrowLeft', 'Home']),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NONE,
      MoveDelta.FIRST
    ),
  },

  moveRight: {
    shortcut: Shortcut.parse('ArrowRight'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NONE,
      MoveDelta.NEXT
    ),
  },

  moveToLastColumn: {
    shortcut: ShortcutGroup.parse(['Primary+ArrowRight', 'End']),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NONE,
      MoveDelta.LAST
    ),
  },

  moveToFirstCell: {
    shortcut: Shortcut.parse('Primary+Home'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.FIRST,
      MoveDelta.FIRST
    ),
  },

  moveToLastCell: {
    shortcut: Shortcut.parse('Primary+End'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.LAST,
      MoveDelta.LAST
    ),
  },
};

export default commands;
