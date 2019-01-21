import {Shortcut, ShortcutGroup} from '@condict/admin-ui';

import moveFocus, {
  MOVE_FIRST,
  MOVE_PREV,
  MOVE_NONE,
  MOVE_NEXT,
  MOVE_LAST,
} from '../value-helpers/move';

export default Object.freeze({
  moveUp: {
    shortcut: Shortcut.parse('ArrowUp'),
    exec: value => moveFocus(value, MOVE_PREV, MOVE_NONE),
  },

  moveToFirstRow: {
    shortcut: Shortcut.parse('Primary+ArrowUp'),
    exec: value => moveFocus(value, MOVE_FIRST, MOVE_NONE),
  },

  moveDown: {
    shortcut: Shortcut.parse('ArrowDown'),
    exec: value => moveFocus(value, MOVE_NEXT, MOVE_NONE),
  },

  moveToLastRow: {
    shortcut: Shortcut.parse('Primary+ArrowDown'),
    exec: value => moveFocus(value, MOVE_LAST, MOVE_NONE),
  },

  moveLeft: {
    shortcut: Shortcut.parse('ArrowLeft'),
    exec: value => moveFocus(value, MOVE_NONE, MOVE_PREV),
  },

  moveToFirstColumn: {
    shortcut: ShortcutGroup.parse(['Primary+ArrowLeft', 'Home']),
    exec: value => moveFocus(value, MOVE_NONE, MOVE_FIRST),
  },

  moveRight: {
    shortcut: Shortcut.parse('ArrowRight'),
    exec: value => moveFocus(value, MOVE_NONE, MOVE_NEXT),
  },

  moveToLastColumn: {
    shortcut: ShortcutGroup.parse(['Primary+ArrowRight', 'End']),
    exec: value => moveFocus(value, MOVE_NONE, MOVE_LAST),
  },

  moveToFirstCell: {
    shortcut: Shortcut.parse('Primary+Home'),
    exec: value => moveFocus(value, MOVE_FIRST, MOVE_FIRST),
  },

  moveToLastCell: {
    shortcut: Shortcut.parse('Primary+End'),
    exec: value => moveFocus(value, MOVE_LAST, MOVE_LAST),
  },
});
