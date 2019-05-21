import {Shortcut, ShortcutGroup} from '@condict/ui';

import moveFocus, {
  MOVE_FIRST,
  MOVE_PREV,
  MOVE_NONE,
  MOVE_NEXT,
  MOVE_LAST,
} from '../value-helpers/move';
import selectEntireTable from '../value-helpers/select-all';

export default Object.freeze({
  selectEntireTable: {
    shortcut: Shortcut.parse('Primary+A a'),
    exec: selectEntireTable,
  },

  selectUp: {
    shortcut: Shortcut.parse('Shift+ArrowUp'),
    exec: value => moveFocus(value, MOVE_PREV, MOVE_NONE, true),
  },

  selectToFirstRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowUp'),
    exec: value => moveFocus(value, MOVE_FIRST, MOVE_NONE, true),
  },

  selectDown: {
    shortcut: Shortcut.parse('Shift+ArrowDown'),
    exec: value => moveFocus(value, MOVE_NEXT, MOVE_NONE, true),
  },

  selectToLastRow: {
    shortcut: Shortcut.parse('Primary+Shift+ArrowDown'),
    exec: value => moveFocus(value, MOVE_LAST, MOVE_NONE, true),
  },

  selectLeft: {
    shortcut: Shortcut.parse('Shift+ArrowLeft'),
    exec: value => moveFocus(value, MOVE_NONE, MOVE_PREV, true),
  },

  selectToFirstColumn: {
    shortcut: ShortcutGroup.parse(['Primary+Shift+ArrowLeft', 'Shift+Home']),
    exec: value => moveFocus(value, MOVE_NONE, MOVE_FIRST, true),
  },

  selectRight: {
    shortcut: Shortcut.parse('Shift+ArrowRight'),
    exec: value => moveFocus(value, MOVE_NONE, MOVE_NEXT, true),
  },

  selectToLastColumn: {
    shortcut: ShortcutGroup.parse(['Primary+Shift+ArrowRight', 'Shift+End']),
    exec: value => moveFocus(value, MOVE_NONE, MOVE_LAST, true),
  },

  selectToFirstCell: {
    shortcut: Shortcut.parse('Primary+Shift+Home'),
    exec: value => moveFocus(value, MOVE_FIRST, MOVE_FIRST, true),
  },

  selectToLastCell: {
    shortcut: Shortcut.parse('Primary+Shift+End'),
    exec: value => moveFocus(value, MOVE_LAST, MOVE_LAST, true),
  },
});
