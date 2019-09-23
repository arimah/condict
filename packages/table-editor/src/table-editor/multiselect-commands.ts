import {CommandSpecMap, Shortcut, ShortcutGroup} from '@condict/ui';

import Value from '../value';
import moveFocus, {MoveDelta} from '../value-helpers/move';
import selectEntireTable from '../value-helpers/select-all';

const commands: CommandSpecMap = {
  selectEntireTable: {
    shortcut: Shortcut.parse('Primary+A a'),
    exec: selectEntireTable,
  },

  selectUp: {
    shortcut: Shortcut.parse('Shift+ArrowUp'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.PREV,
      MoveDelta.NONE,
      true
    ),
  },

  selectToFirstRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowUp'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.FIRST,
      MoveDelta.NONE,
      true
    ),
  },

  selectDown: {
    shortcut: Shortcut.parse('Shift+ArrowDown'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NEXT,
      MoveDelta.NONE,
      true
    ),
  },

  selectToLastRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowDown'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.LAST,
      MoveDelta.NONE,
      true
    ),
  },

  selectLeft: {
    shortcut: Shortcut.parse('Shift+ArrowLeft'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NONE,
      MoveDelta.PREV,
      true
    ),
  },

  selectToFirstColumn: {
    shortcut: ShortcutGroup.parse(['Primary+Shift+ArrowLeft', 'Shift+Home']),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NONE,
      MoveDelta.FIRST,
      true
    ),
  },

  selectRight: {
    shortcut: Shortcut.parse('Shift+ArrowRight'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NONE,
      MoveDelta.NEXT,
      true
    ),
  },

  selectToLastColumn: {
    shortcut: ShortcutGroup.parse(['Primary+Shift+ArrowRight', 'Shift+End']),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.NONE,
      MoveDelta.LAST,
      true
    ),
  },

  selectToFirstCell: {
    shortcut: Shortcut.parse('Primary+Shift+Home'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.FIRST,
      MoveDelta.FIRST,
      true
    ),
  },

  selectToLastCell: {
    shortcut: Shortcut.parse('Primary+Shift+End'),
    exec: <V extends Value<any>>(value: V) => moveFocus(
      value,
      MoveDelta.LAST,
      MoveDelta.LAST,
      true
    ),
  },
};

export default commands;
