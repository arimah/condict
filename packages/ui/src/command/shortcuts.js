import platform from 'platform';

import {Shortcut} from './shortcut';

const isWindows = /windows/i.test(platform.os.family);

export const Shortcuts = Object.freeze({
  undo: Shortcut.parse('Primary+Z z'),

  redo: Shortcut.parse(isWindows ? 'Primary+Y y' : 'Primary+Shift+Z z'),
});
